db.createUser({
    user: 'admin',
    pwd: 'password',
    roles: [
      {
        role: 'readWrite',
        db: 'platform_member_db',
      },
      {
        role: 'dbAdmin',
        db: 'platform_member_db',
      },
      {
        role: 'dbOwner',
        db: 'platform_member_db',
      }
    ],
  });
  
  // Additional setup can go here if necessary, e.g., creating more users, setting up collections, etc.
  