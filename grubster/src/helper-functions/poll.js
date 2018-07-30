export default function poll(fn, callback, interval = 50, expiration = 20000) {

  // If fn returns true, call callbacks
  if (fn()) {

    callback();

  // If time has expired, return
  } else if (expiration <= 0) {

    return console.log('expiration reached');

  // Otherwise, try again and decrement expiration
  } else {
    expiration -= interval;
    return setTimeout(poll.bind(null, fn, callback, interval, expiration), interval);
  }

}