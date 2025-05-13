exports.handler = function(context, event, callback) {
    const twiml = new Twilio.twiml.VoiceResponse();
    
    // Initial welcome and genre selection prompt
    const gather = twiml.gather({
        numDigits: 1,
        action: '/handle-genre',
        method: 'POST'
    });
    
    gather.say('Welcome to HoldTune. Please select what genre you would like to listen to. Press 1 for Jazz, 2 for Pop, or 3 for Classical.');
    
    // If no input received, redirect back to voice function
    twiml.redirect('/voice');
    
    callback(null, twiml);
};