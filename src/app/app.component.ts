import { Component, OnInit } from '@angular/core';
import 'rxjs/add/observable/fromEvent';
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent implements OnInit  {
  name = 'Folks';

  lastActivity?: any ;
  maxInactivityTime?: any;
  timeRemaining?: any;
  sessionIntervals: any =[];
  activityEvents: any = [];
  showPopup?:Boolean = false;
  sessionExpired?: Boolean = false;
  remainingTimePopup?: any;

  ngOnInit() {
    this.sessionIntervals = [];
    this.lastActivity = new Date().getTime();
    this.showPopup = false;
    this.sessionExpired = false;


    //starting point to watch for inactivity
    this.maxInactivityTime = 60000 * 1;
    this.activityWatcher(this.maxInactivityTime);
    //starting point to get user session token expires in time
    this.timeoutWatcher();
    
    
  }

  timeoutWatcher() {
    localStorage.setItem('expiresIn', '1581328560000');
    var expiresIn = localStorage.getItem('expiresIn');
    console.log('expires in String', new Date( Number(expiresIn)));
    console.log('remaining time',new Date( Number(expiresIn)).getTime()-new Date().getTime());
    //checking if expiresIn - current time is in negativity to check session already expired
    if((new Date( Number(expiresIn)).getTime()-new Date().getTime())> 0) {
      var timeoutStart = new Date(Number(expiresIn) - 60000).getTime() - new Date().getTime();
      console.log('timeoutstart', timeoutStart );

    //staring timeout for the session - one minute as buffer time for token refresh
    var expiresInTimer = setTimeout(() => {
      let _that = this;
      this.timeOutWarning.call(_that);
    }, timeoutStart);
    } else {
      this.showPopup = false;
      this.sessionExpired = true;
      console.log('session expired');
      this.clearAllSessionIntervals();
    }
    
  }

    timeOutWarning() {
      console.log('last activity difference', (new Date().getTime() - this.lastActivity) );
    if ((new Date().getTime() - this.lastActivity) < this.maxInactivityTime ) {
      console.log('not idle..request for token');
      this.clearAllSessionIntervals();
     // this.timeoutWatcher();    --to restart all session activity
    } else {
      this.showPopup = true;
      var timeoutIn = localStorage.getItem('expiresIn');
      var timeoutStart =
        new Date(Number(timeoutIn)).getTime() - new Date().getTime();
      console.log('here in timeout', timeoutStart);
      //starting timer for last one minute for user inactivity
      var a = new timer(() => {
        console.log('timedout');
        this.showPopup = false;
        this.sessionExpired = true;
        this.clearAllSessionIntervals();
      }, timeoutStart);
      //getting seconds left from the timer
     var timeleft = setInterval(() => {
        console.log('Time left: ' + a.getTimeLeft() / 1000 + 's');
        this.remainingTimePopup = Math.floor(a.getTimeLeft() / 1000) + 's';
      }, 1000);
      this.sessionIntervals.push(a);
      this.sessionIntervals.push(timeleft);
    }
  }

//clear all intervals related to session
  clearAllSessionIntervals() {
    this.sessionIntervals.forEach(clearInterval);
  }
 
    
  activityWatcher(params) {
  //An array of DOM events that should be interpreted as
  //user activity.
  //The function that will be called whenever a user is active
  const clicks$ = Observable.fromEvent(document, 'mousedown');
  const keypress$ = Observable.fromEvent(document, 'keydown');
  this.activityEvents.push(clicks$);
  this.activityEvents.push(keypress$);
  //clicks$.subscribe(x => console.log('Calling my service here'));
  this.activityEvents.forEach((eventName)=> {eventName.subscribe(()=> {this.lastActivity = new Date().getTime();
  console.log('last activity',this.lastActivity)})});
}

  

//   activityWatcher(params) {
//   //An array of DOM events that should be interpreted as
//   //user activity.
//   //The function that will be called whenever a user is active
//    const activity = () => {
//     //reset the secondsSinceLastActivity variable
//     //back to 0
//     this.lastActivity = new Date().getTime();
//     console.log('last activity', this.lastActivity);
//   }
//   var activityEvents = ['mousedown', 'keydown'];

//   //add these events to the document.
//   //register the activity function as the listener parameter.
//   const that = this;
//   activityEvents.forEach((eventName) =>{
//     document.addEventListener(eventName, function() {this.activity()}.bind(that), true);
//   });
// }
}


function timer(callback, delay) {
  var id,
    started,
    remaining = delay,
    running;

  this.start = function() {
    running = true;
    started = new Date();
    id = setTimeout(callback, remaining);
  };

  this.pause = function() {
    running = false;
    clearTimeout(id);
    remaining -= +new Date() - started;
  };

  this.getTimeLeft = function() {
    if (running) {
      this.pause();
      this.start();
    }

    return remaining;
  };

  this.getStateRunning = function() {
    return running;
  };

  this.start();
}


