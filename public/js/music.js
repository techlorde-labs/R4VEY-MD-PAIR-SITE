const audioTracks = [
    'audio/Dandelions.mp3',
    'audio/blue.mp3',
    'audio/whitekeys.mp3'
];

const audioPlayer = document.getElementById('audioPlayer');

function selectTrack(index, element) {
    document.querySelectorAll('.btn-track').forEach(btn => btn.classList.remove('active'));

    if (audioTracks[index]) {
        element.classList.add('active');
        audioPlayer.src = audioTracks[index];

        // Unlock audio context and play
        audioPlayer.play().catch(err => {
            console.warn("Audio play blocked by browser:", err);
            alert("Tap anywhere on the page first, then select a track!");
        });
    }
}
