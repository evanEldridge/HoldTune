exports.handler = function(context, event, callback) {
    const twiml = new Twilio.twiml.VoiceResponse();
    const digits = event.Digits;
    
    console.log('Received event:', event); // Log full event for debugging
    
    const playlists = {
        '1': {
            name: 'Jazz',
            songs: [
                'https://indigo-caiman-5955.twil.io/assets/Silent%20Reverie.mp3',
                'https://indigo-caiman-5955.twil.io/assets/Timeless%20Echoes.mp3',
                'https://indigo-caiman-5955.twil.io/assets/Whispers%20of%20Serenity.mp3'
            ]
        },
        '2': {
            name: 'Pop',
            songs: [
                'https://indigo-caiman-5955.twil.io/assets/Breaking%20Free.mp3',
                'https://indigo-caiman-5955.twil.io/assets/Electric%20Nights.mp3',
                'https://indigo-caiman-5955.twil.io/assets/Where%20We%20Belong.mp3'
            ]
        },
        '3': {
            name: 'Classical',
            songs: [
                'https://indigo-caiman-5955.twil.io/assets/Elegance%20in%20Counterpoint.mp3',
                'https://indigo-caiman-5955.twil.io/assets/Eternal%20Harmony.mp3',
                'https://indigo-caiman-5955.twil.io/assets/Whispers%20in%20Motion.mp3'
            ]
        }
    };

    // Get the active genre - either from digits (if user just selected) or from currentGenre param
    const activeGenre = playlists[digits] ? digits : (event.currentGenre || '1');
    const songIndex = parseInt(event.songIndex) || 0;
    
    console.log('Active genre and index:', {
        activeGenre,
        songIndex,
        hasPlaylist: !!playlists[activeGenre]
    });

    if (digits === '4') {
        // User requested genre options
        twiml.say('Press 1 for Jazz, 2 for Pop, or 3 for Classical.');
        twiml.redirect(`/handle-genre?currentGenre=${activeGenre}&songIndex=${songIndex}`);
    } else if (digits === '5') {
        // User requested skip to next song
        const nextSongIndex = (songIndex + 1) % playlists[activeGenre].songs.length;
        
        twiml.say('Skipping to next song.');
        const gather = twiml.gather({
            numDigits: 1,
            action: `/handle-genre?currentGenre=${activeGenre}&songIndex=${nextSongIndex}`,
            method: 'POST',
            timeout: 5
        });
        
        gather.play(playlists[activeGenre].songs[nextSongIndex]);
        twiml.redirect(`/handle-genre?currentGenre=${activeGenre}&songIndex=${nextSongIndex}`);
    } else if (playlists[digits]) {
        // User selected a specific genre
        const playlist = playlists[digits];
        // Reset song index when changing genres
        const currentSongIndex = 0;
        
        twiml.say(`You selected ${playlist.name}. Starting music playback.`);
        
        const gather = twiml.gather({
            numDigits: 1,
            action: `/handle-genre?currentGenre=${digits}&songIndex=${currentSongIndex}`,
            method: 'POST',
            timeout: 5
        });
        
        gather.play(playlist.songs[currentSongIndex]);
        
        twiml.say('Thank you for using HoldTune. Remember, you can change genres at any time by pressing 1 for Jazz, 2 for Pop, or 3 for Classical. Press 4 to hear these options again. Press 5 to skip to the next song.');
        
        const nextSongIndex = (currentSongIndex + 1) % playlist.songs.length;
        twiml.redirect(`/handle-genre?currentGenre=${digits}&songIndex=${nextSongIndex}`);
    } else if (playlists[activeGenre] && !(digits > '5' || digits === '0')) {
        // Continue playing current genre
        const playlist = playlists[activeGenre];
        
        const gather = twiml.gather({
            numDigits: 1,
            action: `/handle-genre?currentGenre=${activeGenre}&songIndex=${songIndex}`,
            method: 'POST',
            timeout: 5
        });
        
        gather.play(playlist.songs[songIndex]);
        
        const nextSongIndex = (songIndex + 1) % playlist.songs.length;
        twiml.redirect(`/handle-genre?currentGenre=${activeGenre}&songIndex=${nextSongIndex}`);
    } else {
        // Invalid selection or no context
        twiml.say('Sorry, invalid selection. Please try again.');
        twiml.redirect('/voice');
    }
    
    callback(null, twiml);
};