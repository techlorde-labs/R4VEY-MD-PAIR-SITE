const audioTracks = [
    'audio/Dandelions.mp3',
    'audio/blue.mp3',
    'audio/whitekeys.mp3'
];

const audioPlayer = document.getElementById('audioPlayer');

function selectTrack(index, element) {
    // Remove active class from buttons
    document.querySelectorAll('.btn-track').forEach(btn => btn.classList.remove('active'));

    if (audioTracks[index]) {
        element.classList.add('active');
        audioPlayer.src = audioTracks[index];
        audioPlayer.play().catch(() => {
            console.log("Audio play blocked by browser interaction policy.");
        });
    }
}
