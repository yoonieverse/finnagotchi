import { useContext } from "react";
import { TransactionContext } from "../contexts/transactionContext";


export function Log() {

    const {transactions} = useContext(TransactionContext);
    console.log(transactions)

    return (
        <div>
          <h2>Transactions</h2>
          {transactions && transactions.length > 0 ? (
            <ul>
              {transactions.map((tx, index) => (
                <li key={index}>
                  <strong>{tx.name}</strong>: ${tx.amount} on {tx.date}
                </li>
              ))}
            </ul>
          ) : (
            <p>No transactions available.</p>
          )}
        </div>
      );
    }