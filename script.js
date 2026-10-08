(function() {
      // ============ AUDIO ENGINE ============
      const audio = new Audio();
      audio.volume = 0.75;
      audio.preload = 'auto';

      // ============ STATE ============
      let playlist = [];
      let currentTrackIndex = -1;
      let isPlaying = false;
      let isShuffled = false;
      let repeatMode = 0;
      let volume = 75;

      // ============ PRE-LOADED TRACKS (Users can delete these) ============
      const preloadedTracks = [
        {
          title: 'Ambient Dream',
          artist: 'Royalty Free Music',
          url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          icon: '🌙',
          colorClass: 'c1'
        },
        {
          title: 'Electronic Vibes',
          artist: 'Royalty Free Music',
          url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
          icon: '⚡',
          colorClass: 'c2'
        },
        {
          title: 'Chill Lo-Fi',
          artist: 'Royalty Free Music',
          url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
          icon: '🎧',
          colorClass: 'c3'
        }
      ];

      const colorClasses = ['c1', 'c2', 'c3', 'c4', 'c5'];
      const icons = ['🎵', '🎸', '🎹', '🥁', '🎤', '🎧', '💿', '🎼', '🌟', '💜'];

      // ============ DOM ELEMENTS ============
      const playerCard = document.getElementById('playerCard');
      const albumIcon = document.getElementById('albumIcon');
      const trackTitle = document.getElementById('trackTitle');
      const trackArtist = document.getElementById('trackArtist');
      const currentTimeEl = document.getElementById('currentTime');
      const totalTimeEl = document.getElementById('totalTime');
      const progressBar = document.getElementById('progressBar');
      const progressBarWrapper = document.getElementById('progressBarWrapper');
      const playBtn = document.getElementById('playBtn');
      const playIcon = document.getElementById('playIcon');
      const prevBtn = document.getElementById('prevBtn');
      const nextBtn = document.getElementById('nextBtn');
      const shuffleBtn = document.getElementById('shuffleBtn');
      const repeatBtn = document.getElementById('repeatBtn');
      const volumeSlider = document.getElementById('volumeSlider');
      const volumeIcon = document.getElementById('volumeIcon');
      const playlistContainer = document.getElementById('playlistContainer');
      const trackCount = document.getElementById('trackCount');
      const urlInput = document.getElementById('urlInput');
      const songTitleInput = document.getElementById('songTitleInput');
      const songArtistInput = document.getElementById('songArtistInput');
      const addUrlBtn = document.getElementById('addUrlBtn');
      const clearAllBtn = document.getElementById('clearAllBtn');
      const uploadArea = document.getElementById('uploadArea');
      const fileInput = document.getElementById('fileInput');
      const toast = document.getElementById('toast');

      // ============ AUDIO EVENTS ============
      audio.addEventListener('loadedmetadata', () => {
        if (currentTrackIndex >= 0 && currentTrackIndex < playlist.length) {
          playlist[currentTrackIndex].durationSec = audio.duration;
          playlist[currentTrackIndex].duration = formatTime(audio.duration);
          totalTimeEl.textContent = playlist[currentTrackIndex].duration;
        }
      });

      audio.addEventListener('timeupdate', updateProgressUI);

      audio.addEventListener('play', () => {
        isPlaying = true;
        playerCard.classList.add('playing');
        playIcon.className = 'bi bi-pause-fill';
        updatePlaylistHighlight();
      });

      audio.addEventListener('pause', () => {
        isPlaying = false;
        playerCard.classList.remove('playing');
        playIcon.className = 'bi bi-play-fill';
        updatePlaylistHighlight();
      });

      audio.addEventListener('ended', handleTrackEnd);

      audio.addEventListener('error', () => {
        showToast('❌ Error playing this track. Skipping...');
        if (playlist.length > 1) {
          setTimeout(() => playNext(), 1000);
        }
      });

      // ============ FUNCTIONS ============
      function formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0 || !isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      }

      function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
      }

      function getCurrentTrack() {
        return currentTrackIndex >= 0 && currentTrackIndex < playlist.length ? playlist[currentTrackIndex] : null;
      }

      function updateTrackDisplay() {
        const track = getCurrentTrack();
        if (track) {
          trackTitle.textContent = track.title;
          trackArtist.textContent = track.artist;
          albumIcon.textContent = track.icon || '🎵';
          totalTimeEl.textContent = track.duration || '0:00';
        } else {
          trackTitle.textContent = 'No Track Selected';
          trackArtist.textContent = playlist.length > 0 ? 'Select a track to play' : 'Add music to get started';
          albumIcon.textContent = '🎵';
          totalTimeEl.textContent = '0:00';
          currentTimeEl.textContent = '0:00';
          progressBar.style.width = '0%';
        }
        updatePlaylistHighlight();
        updateTrackCount();
      }

      function updateProgressUI() {
        if (!audio.duration || !isFinite(audio.duration)) return;
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${Math.min(progressPercent, 100)}%`;
        currentTimeEl.textContent = formatTime(audio.currentTime);
      }

      function updateTrackCount() {
        trackCount.textContent = `(${playlist.length} track${playlist.length !== 1 ? 's' : ''})`;
      }

      function handleTrackEnd() {
        if (repeatMode === 2) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        } else if (repeatMode === 1 || currentTrackIndex < playlist.length - 1 || isShuffled) {
          playNext();
        } else {
          // End of playlist
          isPlaying = false;
          playerCard.classList.remove('playing');
          playIcon.className = 'bi bi-play-fill';
          audio.currentTime = 0;
          updateProgressUI();
        }
      }

      function loadTrack(index) {
        if (index < 0 || index >= playlist.length || playlist.length === 0) {
          currentTrackIndex = -1;
          audio.src = '';
          updateTrackDisplay();
          return;
        }
        currentTrackIndex = index;
        const track = playlist[index];
        audio.src = track.url;
        audio.load();
        updateTrackDisplay();
      }

      function playPlayback() {
        if (playlist.length === 0) {
          showToast('⚠️ Add some music first!');
          return;
        }
        if (currentTrackIndex < 0) {
          loadTrack(0);
        }
        if (currentTrackIndex >= 0) {
          audio.play().catch(err => {
            console.log('Play prevented:', err);
            showToast('⚠️ Click play again to start');
          });
        }
      }

      function pausePlayback() {
        audio.pause();
      }

      function togglePlay() {
        if (isPlaying) {
          pausePlayback();
        } else {
          playPlayback();
        }
      }

      function playPrevious() {
        if (playlist.length === 0) return;
        if (audio.currentTime > 3) {
          audio.currentTime = 0;
        } else {
          let newIndex = isShuffled
            ? Math.floor(Math.random() * playlist.length)
            : (currentTrackIndex - 1 + playlist.length) % playlist.length;
          loadTrack(newIndex);
          audio.play().catch(() => {});
        }
      }

      function playNext() {
        if (playlist.length === 0) return;
        let newIndex = isShuffled
          ? Math.floor(Math.random() * playlist.length)
          : (currentTrackIndex + 1) % playlist.length;
        loadTrack(newIndex);
        audio.play().catch(() => {});
      }

      function switchTrack(index) {
        if (index < 0 || index >= playlist.length) return;
        if (index === currentTrackIndex && isPlaying) {
          togglePlay();
          return;
        }
        loadTrack(index);
        audio.play().catch(() => {});
      }

      function toggleShuffle() {
        isShuffled = !isShuffled;
        shuffleBtn.classList.toggle('shuffle-active', isShuffled);
        showToast(isShuffled ? '🔀 Shuffle ON' : '🔀 Shuffle OFF');
      }

      function toggleRepeat() {
        repeatMode = (repeatMode + 1) % 3;
        repeatBtn.classList.remove('repeat-active');
        if (repeatMode === 0) {
          repeatBtn.innerHTML = '<i class="bi bi-repeat"></i>';
          showToast('🔁 Repeat OFF');
        } else if (repeatMode === 1) {
          repeatBtn.classList.add('repeat-active');
          repeatBtn.innerHTML = '<i class="bi bi-repeat"></i>';
          showToast('🔁 Repeat ALL');
        } else {
          repeatBtn.classList.add('repeat-active');
          repeatBtn.innerHTML = '<i class="bi bi-repeat-1"></i>';
          showToast('🔂 Repeat ONE');
        }
      }

      function setVolume(val) {
        volume = Math.max(0, Math.min(100, val));
        volumeSlider.value = volume;
        audio.volume = volume / 100;
        volumeIcon.className = volume === 0 ? 'bi bi-volume-mute-fill volume-icon' :
                              volume < 50 ? 'bi bi-volume-down-fill volume-icon' :
                              'bi bi-volume-up-fill volume-icon';
      }

      function seekTo(e) {
        if (!audio.duration || !isFinite(audio.duration)) return;
        const rect = progressBarWrapper.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        audio.currentTime = percent * audio.duration;
      }

      function buildPlaylistUI() {
        playlistContainer.innerHTML = '';
        if (playlist.length === 0) {
          playlistContainer.innerHTML = '<div style="color:var(--text-secondary);text-align:center;padding:1rem;font-size:0.8rem;">No songs in playlist</div>';
          updateTrackCount();
          return;
        }
        playlist.forEach((track, index) => {
          const item = document.createElement('div');
          item.className = `playlist-item${index === currentTrackIndex ? ' active' : ''}`;
          item.innerHTML = `
            <div class="playlist-num ${track.colorClass || 'c1'}">${index + 1}</div>
            <div class="playlist-info">
              <div class="playlist-title">${track.title}</div>
              <div class="playlist-artist">${track.artist || 'Unknown Artist'}</div>
            </div>
            <span class="playlist-duration">${track.duration || '--:--'}</span>
            <button class="delete-btn" data-index="${index}" title="Remove track">
              <i class="bi bi-x-circle-fill"></i>
            </button>
            ${index === currentTrackIndex && isPlaying ? '<span class="active-indicator"></span>' : ''}
          `;

          // Click to play
          item.addEventListener('click', (e) => {
            if (!e.target.closest('.delete-btn')) {
              switchTrack(index);
            }
          });

          // Delete button
          const deleteBtn = item.querySelector('.delete-btn');
          deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeTrack(index);
          });

          playlistContainer.appendChild(item);
        });
        updateTrackCount();
      }

      function updatePlaylistHighlight() {
        const items = playlistContainer.querySelectorAll('.playlist-item');
        items.forEach((item, i) => {
          item.classList.toggle('active', i === currentTrackIndex);
          const ind = item.querySelector('.active-indicator');
          if (ind) ind.remove();
          if (i === currentTrackIndex && isPlaying) {
            const dot = document.createElement('span');
            dot.className = 'active-indicator';
            item.appendChild(dot);
          }
        });
      }

      function addTrack(trackData) {
        playlist.push({
          title: trackData.title,
          artist: trackData.artist || 'Unknown Artist',
          duration: '--:--',
          durationSec: 0,
          icon: trackData.icon || icons[Math.floor(Math.random() * icons.length)],
          colorClass: trackData.colorClass || colorClasses[playlist.length % colorClasses.length],
          url: trackData.url,
          isRemovable: true
        });
        buildPlaylistUI();
        if (currentTrackIndex < 0) {
          loadTrack(0);
        }
        showToast(`✅ Added: ${trackData.title}`);
      }

      function removeTrack(index) {
        if (index < 0 || index >= playlist.length) return;
        const trackName = playlist[index].title;
        
        // Release object URL if local
        if (playlist[index].url.startsWith('blob:')) {
          URL.revokeObjectURL(playlist[index].url);
        }

        playlist.splice(index, 1);

        if (playlist.length === 0) {
          currentTrackIndex = -1;
          audio.pause();
          audio.src = '';
          isPlaying = false;
          playerCard.classList.remove('playing');
          playIcon.className = 'bi bi-play-fill';
        } else if (index === currentTrackIndex) {
          if (index >= playlist.length) {
            currentTrackIndex = playlist.length - 1;
          }
          loadTrack(currentTrackIndex);
          if (isPlaying) audio.play().catch(() => {});
        } else if (index < currentTrackIndex) {
          currentTrackIndex--;
        }

        buildPlaylistUI();
        updateTrackDisplay();
        showToast(`🗑️ Removed: ${trackName}`);
      }

      function clearAllTracks() {
        if (playlist.length === 0) {
          showToast('⚠️ Playlist is already empty');
          return;
        }
        if (confirm(`Delete all ${playlist.length} tracks? This cannot be undone.`)) {
          // Release all object URLs
          playlist.forEach(track => {
            if (track.url.startsWith('blob:')) {
              URL.revokeObjectURL(track.url);
            }
          });
          playlist = [];
          currentTrackIndex = -1;
          audio.pause();
          audio.src = '';
          isPlaying = false;
          playerCard.classList.remove('playing');
          playIcon.className = 'bi bi-play-fill';
          buildPlaylistUI();
          updateTrackDisplay();
          showToast('🗑️ All tracks removed');
        }
      }

      function addTrackByURL(url, customTitle, customArtist) {
        if (!url) {
          showToast('⚠️ Please enter a URL');
          return;
        }
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          showToast('⚠️ URL must start with http:// or https://');
          return;
        }

        addUrlBtn.disabled = true;
        addUrlBtn.innerHTML = '<i class="bi bi-hourglass-split"></i>';

        // Try to validate URL
        fetch(url, { method: 'HEAD', mode: 'no-cors' })
          .then(() => extractAndAdd(url, customTitle, customArtist))
          .catch(() => extractAndAdd(url, customTitle, customArtist));
      }

      function extractAndAdd(url, customTitle, customArtist) {
        let filename = url.split('/').pop().split('?')[0];
        let nameWithoutExt = decodeURIComponent(filename.replace(/\.[^/.]+$/, ''));
        
        let title = customTitle || nameWithoutExt || 'Unknown Track';
        let artist = customArtist || 'Unknown Artist';

        if (!customTitle && !customArtist && nameWithoutExt.includes(' - ')) {
          const parts = nameWithoutExt.split(' - ');
          artist = parts[0].trim();
          title = parts.slice(1).join(' - ').trim();
        }

        addTrack({
          title: title,
          artist: artist,
          url: url
        });

        urlInput.value = '';
        songTitleInput.value = '';
        songArtistInput.value = '';
        addUrlBtn.disabled = false;
        addUrlBtn.innerHTML = '<i class="bi bi-plus-lg"></i> Add';
      }

      function addLocalFiles(files) {
        let addedCount = 0;
        Array.from(files).forEach(file => {
          if (!file.type.startsWith('audio/')) return;
          
          const url = URL.createObjectURL(file);
          const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
          let title = nameWithoutExt;
          let artist = 'Local File';

          if (nameWithoutExt.includes(' - ')) {
            const parts = nameWithoutExt.split(' - ');
            artist = parts[0].trim();
            title = parts.slice(1).join(' - ').trim();
          }

          addTrack({
            title: title,
            artist: artist,
            url: url
          });
          addedCount++;
        });
        if (addedCount > 0) {
          showToast(`📁 Added ${addedCount} file${addedCount > 1 ? 's' : ''}`);
        }
      }

      // ============ EVENT LISTENERS ============
      playBtn.addEventListener('click', togglePlay);
      prevBtn.addEventListener('click', playPrevious);
      nextBtn.addEventListener('click', playNext);
      shuffleBtn.addEventListener('click', toggleShuffle);
      repeatBtn.addEventListener('click', toggleRepeat);

      volumeSlider.addEventListener('input', (e) => setVolume(parseInt(e.target.value)));
      volumeIcon.addEventListener('click', () => setVolume(volume > 0 ? 0 : 75));

      // Add by URL
      addUrlBtn.addEventListener('click', () => {
        addTrackByURL(urlInput.value.trim(), songTitleInput.value.trim(), songArtistInput.value.trim());
      });
      urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          addTrackByURL(urlInput.value.trim(), songTitleInput.value.trim(), songArtistInput.value.trim());
        }
      });

      // Clear all
      clearAllBtn.addEventListener('click', clearAllTracks);

      // File upload
      uploadArea.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          addLocalFiles(e.target.files);
          fileInput.value = '';
        }
      });

      // Drag & drop
      uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--accent-2)';
        uploadArea.style.background = 'rgba(255,169,77,0.05)';
      });
      uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'rgba(255,255,255,0.15)';
        uploadArea.style.background = 'transparent';
      });
      uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'rgba(255,255,255,0.15)';
        uploadArea.style.background = 'transparent';
        if (e.dataTransfer.files.length > 0) {
          addLocalFiles(e.dataTransfer.files);
        }
      });

      // Progress seeking
      let dragging = false;
      progressBarWrapper.addEventListener('click', seekTo);
      progressBarWrapper.addEventListener('mousedown', () => dragging = true);
      document.addEventListener('mousemove', (e) => dragging && seekTo(e));
      document.addEventListener('mouseup', () => dragging = false);
      progressBarWrapper.addEventListener('touchstart', (e) => { dragging = true; seekTo(e.touches[0]); });
      document.addEventListener('touchmove', (e) => dragging && seekTo(e.touches[0]));
      document.addEventListener('touchend', () => dragging = false);

      // Paste URL from clipboard
      document.addEventListener('paste', (e) => {
        const clipboardText = e.clipboardData?.getData('text');
        if (clipboardText && clipboardText.startsWith('http') && document.activeElement !== urlInput) {
          urlInput.value = clipboardText;
          urlInput.focus();
          showToast('📋 URL pasted! Enter title/artist or just click Add');
        }
      });

      // Keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
        else if (e.code === 'ArrowLeft') { e.preventDefault(); audio.currentTime = Math.max(0, audio.currentTime - 5); }
        else if (e.code === 'ArrowRight') { e.preventDefault(); audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5); }
        else if (e.code === 'ArrowUp') { e.preventDefault(); setVolume(volume + 5); }
        else if (e.code === 'ArrowDown') { e.preventDefault(); setVolume(volume - 5); }
      });

      // ============ INITIALIZATION ============
      function init() {
        // Load pre-loaded tracks
        preloadedTracks.forEach(track => {
          playlist.push({
            ...track,
            duration: '--:--',
            durationSec: 0,
            isRemovable: true
          });
        });

        buildPlaylistUI();
        if (playlist.length > 0) {
          loadTrack(0);
        }
        updateTrackDisplay();
        setVolume(75);
        updateTrackCount();

        console.log('🎵 VIBE Music Player Ready!');
        console.log('✅ Pre-loaded tracks can be deleted');
        console.log('➕ Add music by URL or upload files');
        console.log('⌨️ Space=Play/Pause, ←→=Seek, ↑↓=Volume');
        console.log('🖱️ Hover over track → Click X to remove');
      }

      init();
    })();