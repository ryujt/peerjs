import React from 'react';
import './UserList.css';

function UserList({ users, onUserClick, currentUser }) {
  return (
    <div className="user-list">
      <h3>Online Users</h3>
      <div className="current-user">
        <div className="user-item current">
          <span className="user-status online"></span>
          <span className="user-name">{currentUser} (You)</span>
        </div>
      </div>
      <div className="other-users">
        {users.length === 0 ? (
          <p className="no-users">No other users online</p>
        ) : (
          users.map((user) => (
            <div
              key={user.peerId}
              className="user-item"
              onClick={() => onUserClick(user)}
            >
              <span className="user-status online"></span>
              <span className="user-name">{user.username}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default UserList;