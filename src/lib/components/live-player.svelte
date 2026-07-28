<!-- <script>
  import '@mux/mux-player';

  let { playbackId, title = 'Live' } = $props();
</script>

{#if playbackId}
  <mux-player
    playback-id={playbackId}
    stream-type="live"
    metadata-video-title={title}
    autoplay
    muted
    style="width: 100%; aspect-ratio: 16/9;"
  ></mux-player>
{/if} -->

<script>
  import '@mux/mux-player';

  let { playbackId, title = 'Live', streamType = 'live', autoplay = true, muted = true } = $props();
</script>

{#if playbackId}
  <mux-player
    playback-id={playbackId}
    stream-type={streamType}
    metadata-video-title={title}
    {autoplay}
    {muted}
    style="width: 100%; aspect-ratio: 16/9;"
  ></mux-player>
{/if}