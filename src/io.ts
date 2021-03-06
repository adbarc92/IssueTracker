const io = (window as any).io;

console.log('Creating socket!!');

export const socket = io({ upgrade: false, transports: ['websocket'] });

// * Socket is an event emitter/receiver
socket.on('connect', () => {
  console.log('socket.io connected');
});
