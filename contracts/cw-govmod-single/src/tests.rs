use cosmwasm_std::{to_binary, Addr, Decimal, Empty, Uint128};
use cw20::Cw20Coin;
use cw_multi_test::{App, Contract, ContractWrapper, Executor};

use crate::{
    msg::{ExecuteMsg, InstantiateMsg, QueryMsg},
    proposal::{Proposal, Status, Vote, Votes},
    query::{ProposalResponse, VoteInfo, VoteResponse},
    state::Config,
    threshold::Threshold,
};

const CREATOR_ADDR: &str = "creator";

fn cw20_contract() -> Box<dyn Contract<Empty>> {
    let contract = ContractWrapper::new(
        cw20_base::contract::execute,
        cw20_base::contract::instantiate,
        cw20_base::contract::query,
    );
    Box::new(contract)
}

fn single_govmod_contract() -> Box<dyn Contract<Empty>> {
    let contract = ContractWrapper::new(
        crate::contract::execute,
        crate::contract::instantiate,
        crate::contract::query,
    );
    Box::new(contract)
}

fn cw20_balances_voting() -> Box<dyn Contract<Empty>> {
    let contract = ContractWrapper::new(
        cw20_balance_voting::contract::execute,
        cw20_balance_voting::contract::instantiate,
        cw20_balance_voting::contract::query,
    )
    .with_reply(cw20_balance_voting::contract::reply);
    Box::new(contract)
}

fn cw_gov_contract() -> Box<dyn Contract<Empty>> {
    let contract = ContractWrapper::new(
        cw_governance::contract::execute,
        cw_governance::contract::instantiate,
        cw_governance::contract::query,
    )
    .with_reply(cw_governance::contract::reply);
    Box::new(contract)
}

fn instantiate_governance(
    app: &mut App,
    code_id: u64,
    msg: cw_governance::msg::InstantiateMsg,
) -> Addr {
    app.instantiate_contract(
        code_id,
        Addr::unchecked(CREATOR_ADDR),
        &msg,
        &[],
        "cw-governance",
        None,
    )
    .unwrap()
}

fn instantiate_with_default_governance(
    app: &mut App,
    code_id: u64,
    msg: InstantiateMsg,
    initial_balances: Option<Vec<Cw20Coin>>,
) -> Addr {
    let cw20_id = app.store_code(cw20_contract());
    let governance_id = app.store_code(cw_gov_contract());
    let votemod_id = app.store_code(cw20_balances_voting());

    let initial_balances = initial_balances.unwrap_or(vec![Cw20Coin {
        address: CREATOR_ADDR.to_string(),
        amount: Uint128::new(100_000_000),
    }]);

    let governance_instantiate = cw_governance::msg::InstantiateMsg {
        name: "DAO DAO".to_string(),
        description: "A DAO that builds DAOs".to_string(),
        image_url: None,
        voting_module_instantiate_info: cw_governance::msg::ModuleInstantiateInfo {
            code_id: votemod_id,
            msg: to_binary(&cw20_balance_voting::msg::InstantiateMsg {
                token_info: cw20_balance_voting::msg::TokenInfo::New {
                    code_id: cw20_id,
                    label: "DAO DAO governance token".to_string(),
                    name: "DAO".to_string(),
                    symbol: "DAO".to_string(),
                    decimals: 6,
                    initial_balances,
                    marketing: None,
                },
            })
            .unwrap(),
            admin: cw_governance::msg::Admin::GovernanceContract {},
            label: "DAO DAO voting module".to_string(),
        },
        governance_modules_instantiate_info: vec![cw_governance::msg::ModuleInstantiateInfo {
            code_id,
            msg: to_binary(&msg).unwrap(),
            admin: cw_governance::msg::Admin::GovernanceContract {},
            label: "DAO DAO governance module".to_string(),
        }],
    };

    instantiate_governance(app, governance_id, governance_instantiate)
}

#[test]
fn test_propose() {
    let mut app = App::default();
    let govmod_id = app.store_code(single_govmod_contract());

    let threshold = Threshold::AbsolutePercentage {
        percentage: Decimal::percent(50),
    };
    let max_voting_period = cw_utils::Duration::Height(6);
    let instantiate = InstantiateMsg {
        threshold: threshold.clone(),
        max_voting_period: max_voting_period.clone(),
        only_members_execute: false,
    };

    let governance_addr =
        instantiate_with_default_governance(&mut app, govmod_id, instantiate, None);
    let governance_modules: Vec<Addr> = app
        .wrap()
        .query_wasm_smart(
            governance_addr.clone(),
            &cw_governance::msg::QueryMsg::GovernanceModules {
                start_at: None,
                limit: None,
            },
        )
        .unwrap();

    assert_eq!(governance_modules.len(), 1);
    let govmod_single = governance_modules.into_iter().nth(0).unwrap();

    // Check that the governance module has been configured correctly.
    let config: Config = app
        .wrap()
        .query_wasm_smart(govmod_single.clone(), &QueryMsg::Config {})
        .unwrap();
    let expected = Config {
        threshold: threshold.clone(),
        max_voting_period: max_voting_period.clone(),
        only_members_execute: false,
        dao: governance_addr.clone(),
    };
    assert_eq!(config, expected);

    // Create a new proposal.
    app.execute_contract(
        Addr::unchecked(CREATOR_ADDR),
        govmod_single.clone(),
        &ExecuteMsg::Propose {
            title: "A simple text proposal".to_string(),
            description: "This is a simple text proposal".to_string(),
            msgs: vec![],
            latest: None,
        },
        &[],
    )
    .unwrap();

    let created: ProposalResponse = app
        .wrap()
        .query_wasm_smart(
            govmod_single.clone(),
            &QueryMsg::Proposal { proposal_id: 1 },
        )
        .unwrap();
    let current_block = app.block_info();
    let expected = Proposal {
        title: "A simple text proposal".to_string(),
        description: "This is a simple text proposal".to_string(),
        proposer: Addr::unchecked(CREATOR_ADDR),
        start_height: current_block.height,
        expiration: max_voting_period.after(&current_block),
        threshold: threshold.clone(),
        total_power: Uint128::new(100_000_000),
        msgs: vec![],
        status: crate::proposal::Status::Open,
        votes: Votes::zero(),
    };

    assert_eq!(created.proposal, expected);
    assert_eq!(created.id, 1u64);
}

struct TestVote {
    /// The address casting the vote.
    voter: String,
    /// Position on the vote.
    position: Vote,
    /// Voting power of the address.
    weight: Uint128,
    /// If this vote is expected to execute.
    should_execute: bool,
}

fn do_test_votes(votes: Vec<TestVote>, threshold: Threshold, expected_status: Status) {
    let mut app = App::default();
    let govmod_id = app.store_code(single_govmod_contract());

    let initial_balances = votes
        .iter()
        .map(|TestVote { voter, weight, .. }| Cw20Coin {
            address: voter.to_string(),
            amount: *weight,
        })
        .collect();

    let proposer = match votes.first() {
        Some(vote) => vote.voter.clone(),
        None => panic!("do_test_votes must have at least one vote."),
    };

    let max_voting_period = cw_utils::Duration::Height(6);
    let instantiate = InstantiateMsg {
        threshold,
        max_voting_period,
        only_members_execute: false,
    };

    let governance_addr = instantiate_with_default_governance(
        &mut app,
        govmod_id,
        instantiate,
        Some(initial_balances),
    );

    let governance_modules: Vec<Addr> = app
        .wrap()
        .query_wasm_smart(
            governance_addr.clone(),
            &cw_governance::msg::QueryMsg::GovernanceModules {
                start_at: None,
                limit: None,
            },
        )
        .unwrap();

    assert_eq!(governance_modules.len(), 1);
    let govmod_single = governance_modules.into_iter().nth(0).unwrap();
    app.execute_contract(
        Addr::unchecked(proposer),
        govmod_single.clone(),
        &ExecuteMsg::Propose {
            title: "A simple text proposal".to_string(),
            description: "This is a simple text proposal".to_string(),
            msgs: vec![],
            latest: None,
        },
        &[],
    )
    .unwrap();

    // Cast votes.
    for vote in votes {
        let TestVote {
            voter,
            position,
            weight,
            should_execute,
        } = vote;
        // Vote on the proposal.
        let res = app.execute_contract(
            Addr::unchecked(voter.clone()),
            govmod_single.clone(),
            &ExecuteMsg::Vote {
                proposal_id: 1,
                vote: position,
            },
            &[],
        );
        if should_execute {
            assert!(res.is_ok());
            // Check that the vote was recorded correctly.
            let vote: VoteResponse = app
                .wrap()
                .query_wasm_smart(
                    govmod_single.clone(),
                    &QueryMsg::Vote {
                        proposal_id: 1,
                        voter: voter.clone(),
                    },
                )
                .unwrap();
            let expected = VoteResponse {
                vote: Some(VoteInfo {
                    voter: Addr::unchecked(voter),
                    vote: position,
                    power: weight,
                }),
            };
            assert_eq!(vote, expected)
        } else {
            assert!(res.is_err())
        }
    }

    let proposal: ProposalResponse = app
        .wrap()
        .query_wasm_smart(govmod_single, &QueryMsg::Proposal { proposal_id: 1 })
        .unwrap();

    assert_eq!(proposal.proposal.status, expected_status)
}

#[test]
fn test_vote_simple() {
    do_test_votes(
        vec![TestVote {
            voter: "ekez".to_string(),
            position: Vote::Yes,
            weight: Uint128::new(10),
            should_execute: true,
        }],
        Threshold::AbsolutePercentage {
            percentage: Decimal::percent(100),
        },
        Status::Passed,
    );

    do_test_votes(
        vec![TestVote {
            voter: "ekez".to_string(),
            position: Vote::No,
            weight: Uint128::new(10),
            should_execute: true,
        }],
        Threshold::AbsolutePercentage {
            percentage: Decimal::percent(100),
        },
        Status::Rejected,
    )
}

#[test]
fn test_vote_no_overflow() {
    // We should not overflow when computing passing thresholds even
    // when there are 2^128 votes.
    do_test_votes(
        vec![TestVote {
            voter: "ekez".to_string(),
            position: Vote::Yes,
            weight: Uint128::new(u128::max_value()),
            should_execute: true,
        }],
        Threshold::AbsolutePercentage {
            percentage: Decimal::percent(100),
        },
        Status::Passed,
    );
}

#[test]
fn test_vote_abstain_only() {
    do_test_votes(
        vec![TestVote {
            voter: "ekez".to_string(),
            position: Vote::Abstain,
            weight: Uint128::new(u128::max_value()),
            should_execute: true,
        }],
        Threshold::AbsolutePercentage {
            percentage: Decimal::percent(100),
        },
        Status::Open,
    );
}

/// The current behavior for passing proposals is that the first
/// option to reach the threshold wins. For example, with a 50%
/// passing threshold if 50% of voting power votes no that proposal
/// fails even if the other 50% would have voted yes. The same goes if
/// the yes and no were reversed.
///
/// TODO(zeke): is this the behavior that we want?
#[test]
fn test_close_votes() {
    do_test_votes(
        vec![
            TestVote {
                voter: "ekez".to_string(),
                position: Vote::Abstain,
                weight: Uint128::new(10),
                should_execute: true,
            },
            TestVote {
                voter: "keze".to_string(),
                position: Vote::No,
                weight: Uint128::new(5),
                should_execute: true,
            },
            TestVote {
                voter: "ezek".to_string(),
                position: Vote::Yes,
                weight: Uint128::new(5),
                should_execute: false,
            },
        ],
        Threshold::AbsolutePercentage {
            percentage: Decimal::percent(50),
        },
        Status::Rejected,
    );

    do_test_votes(
        vec![
            TestVote {
                voter: "ekez".to_string(),
                position: Vote::Abstain,
                weight: Uint128::new(10),
                should_execute: true,
            },
            TestVote {
                voter: "keze".to_string(),
                position: Vote::Yes,
                weight: Uint128::new(5),
                should_execute: true,
            },
            TestVote {
                voter: "ezek".to_string(),
                position: Vote::No,
                weight: Uint128::new(5),
                should_execute: false,
            },
        ],
        Threshold::AbsolutePercentage {
            percentage: Decimal::percent(50),
        },
        Status::Passed,
    );
}

/// Another test which demonstrates the trouble with our "first to
/// reach threshold" method for determining the winner. In this case
/// there are more no votes than yes votes but because yes votes are
/// the first ones to reach the threshold after the quorum has been
/// passed yes votes win.
///
/// This is a pretty nonsense passing threshold but helps demonstrate
/// the issue well enough.
#[test]
fn test_close_votes_quorum() {
    do_test_votes(
        vec![
            TestVote {
                voter: "ekez".to_string(),
                position: Vote::No,
                weight: Uint128::new(10),
                should_execute: true,
            },
            TestVote {
                voter: "keze".to_string(),
                position: Vote::Yes,
                weight: Uint128::new(5),
                should_execute: true,
            },
            TestVote {
                voter: "ezek".to_string(),
                position: Vote::No,
                weight: Uint128::new(10),
                should_execute: false,
            },
        ],
        Threshold::ThresholdQuorum {
            threshold: Decimal::percent(10),
            quorum: Decimal::percent(50),
        },
        Status::Passed,
    );
}
