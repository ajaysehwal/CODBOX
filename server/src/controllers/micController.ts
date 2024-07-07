import { Socket } from "socket.io";

export class VoiceCommunication {
  constructor(public socket: Socket) {
    this.init();
  }
  private init() {
    this.handleSignal()
  }

  private onMicON(){
    //  this.socket.on("micOn")
  }
  private handleSignal(){
    this.socket.on('signal',(data)=>{
      this.socket.emit('signal',data);
      console.log('single',data);
    })
  }
}
