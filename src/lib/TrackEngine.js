
export default class TrackEngine{
    constructor(audioContext, buffer, track, BPM) {
        this.audioContext = audioContext;
        this.buffer = buffer;
        this.track = track;
        this.BPM = BPM;
        this.step = 0;

        this.output = this.audioContext.createGain();
        
        //le petit trick pour le problème du "this"
        this.render = this.render.bind(this);
    }

    render(time) { // le temps il vient du Scheduler
        console.log(this.step);

        if (this.track[this.step] !==0){
            const src = this.audioContext.createBufferSource();
            src.connect(this.output);
            src.buffer = this.buffer;
            src.start(time);
        }
        this.step = (this.step + 1) % this.track.length;

        return time + 60 / this.BPM;
    }
}