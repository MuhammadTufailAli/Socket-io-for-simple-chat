const io = require('socket.io')(8900, {
  cors: {
    origin: 'http://localhost:3001', //It is address of our react application
  },
});

let users = [];

//To add user to live users list
const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

//TO remove disconnected user
const removeUser = (socketId) => {
  console.log('Socket id is ' + socketId);
  console.log('Before delete users are' + users);
  users = users.filter((user) => user.socketId !== socketId);
  console.log('After delete users are' + users);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on('connection', (socket) => {
  console.log('A user connected');
  //After connection take userId and socketId from user
  socket.on('addUser', (userId) => {
    if (userId) {
      addUser(userId, socket.id);

      io.emit('getUsers', users); //is sa pata chla ga kon kon online ha
      //hum client side pa user ka is tarha get karta ha k 'getUsers' humara liya key ha
      //hum client side pa is key ko use karta hova value yani users get kar lata ha
    }
  });

  //Get message from user
  socket.on('sendMessage', ({ senderId, receiverId, text }) => {
    if (receiverId) {
      const user = getUser(receiverId); //Is sa huma pata chl gaya kis banda ko message send karna ha
      //ab us user ki socketId sa hum usa sender ka message send kar da ga
      //hum senderId and text semd kara ga
      console.log('we are going to send message to user');

      io.to(user?.socketId).emit('getMessage', {
        senderId,
        text,
      });
    }
  });

  //If a user is discoonect or logout then we will remove this user from online users
  socket.on('disconnect', () => {
    console.log('A user is disconnected');
    removeUser(socket.id);

    io.emit('getUsers', users); //User remove karna k bad phr online user send kar da ga
  });
});
