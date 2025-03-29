import React from 'react';
import './ExamplesModal.css';

interface Example {
  name: string;
  description: string;
  code: string;
  category: string;
}

interface ExamplesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (code: string) => void;
}

const examples: Example[] = [
  {
    name: 'Simple Token',
    description: 'Basic token contract with transfer functionality',
    category: 'Tokens',
    code: `contract SimpleToken {
    state {
        name: string;
        symbol: string;
        decimals: uint;
        total_supply: uint;
        balances: map<address, uint>;
    }
    
    constructor(name: string, symbol: string, decimals: uint, initial_supply: uint) {
        self.name = name;
        self.symbol = symbol;
        self.decimals = decimals;
        total_supply = initial_supply;
        balances[msg.sender] = initial_supply;
    }
    
    function transfer(to: address, amount: uint) returns bool {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        balances[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    view function balance_of(account: address) returns uint {
        return balances[account];
    }
    
    event Transfer(from: address, to: address, amount: uint);
}`
  },
  {
    name: 'Voting Contract',
    description: 'Simple voting system with proposal creation and voting',
    category: 'Governance',
    code: `contract Voting {
    struct Proposal {
        id: uint;
        name: string;
        vote_count: uint;
        executed: bool;
    }
    
    state {
        owner: address;
        proposals: map<uint, Proposal>;
        next_proposal_id: uint;
        voters: map<address, bool>;
    }
    
    constructor() {
        owner = msg.sender;
        next_proposal_id = 1;
    }
    
    function create_proposal(name: string) returns uint {
        require(msg.sender == owner, "Only owner can create proposals");
        
        let proposal_id: uint = next_proposal_id;
        proposals[proposal_id] = Proposal {
            id: proposal_id,
            name: name,
            vote_count: 0,
            executed: false
        };
        
        next_proposal_id += 1;
        emit ProposalCreated(proposal_id, name);
        
        return proposal_id;
    }
    
    function vote(proposal_id: uint) returns bool {
        require(!voters[msg.sender], "Already voted");
        require(proposals[proposal_id].id != 0, "Proposal does not exist");
        require(!proposals[proposal_id].executed, "Proposal already executed");
        
        voters[msg.sender] = true;
        proposals[proposal_id].vote_count += 1;
        
        emit Voted(proposal_id, msg.sender);
        return true;
    }
    
    event ProposalCreated(id: uint, name: string);
    event Voted(proposal_id: uint, voter: address);
}`
  },
  {
    name: 'Multi-Signature Wallet',
    description: 'Wallet requiring multiple signatures for transactions',
    category: 'Security',
    code: `contract MultiSigWallet {
    struct Transaction {
        to: address;
        value: uint;
        data: bytes;
        executed: bool;
        num_confirmations: uint;
    }
    
    state {
        owners: array<address>;
        required_confirmations: uint;
        transactions: map<uint, Transaction>;
        next_transaction_id: uint;
        confirmations: map<uint, map<address, bool>>;
    }
    
    constructor(owners: array<address>, required_confirmations: uint) {
        require(owners.length > 0, "No owners provided");
        require(required_confirmations > 0, "Required confirmations must be > 0");
        require(required_confirmations <= owners.length, "Required confirmations exceeds owners");
        
        self.owners = owners;
        self.required_confirmations = required_confirmations;
        next_transaction_id = 1;
    }
    
    function submit_transaction(to: address, value: uint, data: bytes) returns uint {
        require(to != address(0), "Invalid recipient");
        
        let transaction_id: uint = next_transaction_id;
        transactions[transaction_id] = Transaction {
            to: to,
            value: value,
            data: data,
            executed: false,
            num_confirmations: 0
        };
        
        next_transaction_id += 1;
        emit TransactionSubmitted(transaction_id, to, value, data);
        
        return transaction_id;
    }
    
    function confirm_transaction(transaction_id: uint) returns bool {
        require(transactions[transaction_id].to != address(0), "Transaction does not exist");
        require(!transactions[transaction_id].executed, "Transaction already executed");
        require(!confirmations[transaction_id][msg.sender], "Already confirmed");
        
        confirmations[transaction_id][msg.sender] = true;
        transactions[transaction_id].num_confirmations += 1;
        
        emit TransactionConfirmed(transaction_id, msg.sender);
        
        if (transactions[transaction_id].num_confirmations >= required_confirmations) {
            execute_transaction(transaction_id);
        }
        
        return true;
    }
    
    function execute_transaction(transaction_id: uint) internal {
        let tx: Transaction = transactions[transaction_id];
        require(tx.num_confirmations >= required_confirmations, "Not enough confirmations");
        require(!tx.executed, "Already executed");
        
        tx.executed = true;
        // Here you would implement the actual transfer logic
        
        emit TransactionExecuted(transaction_id);
    }
    
    event TransactionSubmitted(id: uint, to: address, value: uint, data: bytes);
    event TransactionConfirmed(id: uint, owner: address);
    event TransactionExecuted(id: uint);
}`
  }
];

const ExamplesModal: React.FC<ExamplesModalProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  const categories = Array.from(new Set(examples.map(ex => ex.category)));

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Code Examples</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {categories.map(category => (
            <div key={category} className="category-section">
              <h3>{category}</h3>
              <div className="examples-grid">
                {examples
                  .filter(ex => ex.category === category)
                  .map((example, index) => (
                    <div key={index} className="example-card">
                      <h4>{example.name}</h4>
                      <p>{example.description}</p>
                      <button onClick={() => onSelect(example.code)}>
                        Use Example
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamplesModal; 