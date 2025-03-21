<script>
  export let statusHistory = [];
  
  // Sort status history by date, newest first
  $: sortedHistory = [...statusHistory].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
  
  // Function to get appropriate status color class
  function getStatusClass(status) {
    switch (status.toLowerCase()) {
      case 'eligible':
        return 'status-eligible';
      case 'ineligible':
        return 'status-ineligible';
      case 'non-compliant':
        return 'status-non-compliant';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  }
  
  // Format date for better display with time and timezone info
  function formatDate(dateString) {
    try {
      const date = new Date(dateString);
      
      // Format date with time and timezone (UTC)
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      
      return `${formattedDate} at ${formattedTime} UTC`;
    } catch (e) {
      return dateString;
    }
  }
</script>

<div class="status-history">
  <h3>Status History</h3>
  
  {#if !statusHistory || statusHistory.length === 0}
    <p class="empty-state">No status history available.</p>
  {:else}
    <div class="timeline">
      {#each sortedHistory as entry, i}
        <div class="timeline-item">
          <div class="timeline-marker">
            <div class="marker-circle {getStatusClass(entry.status)}"></div>
            <div class="marker-line" class:last-item={i === sortedHistory.length - 1}></div>
          </div>
          <div class="timeline-content">
            <div class="status-badge {getStatusClass(entry.status)}">
              {entry.status}
            </div>
            <div class="status-info">
              <div class="status-timestamp">
                <div class="status-date">{formatDate(entry.date)}</div>
                <div class="status-time-exact">Exact timestamp: {entry.date}</div>
              </div>
              <div class="status-user">Changed by: {entry.changedBy || 'Unknown'}</div>
              {#if entry.note}
                <div class="status-note">{entry.note}</div>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .status-history {
    margin: 1rem 0;
  }
  
  .status-history h3 {
    margin-bottom: 1rem;
    color: #495057;
    font-size: 1.1rem;
  }
  
  .empty-state {
    padding: 1rem;
    background-color: #f8f9fa;
    text-align: center;
    color: #6c757d;
    border-radius: 4px;
  }
  
  .timeline {
    position: relative;
  }
  
  .timeline-item {
    display: flex;
    margin-bottom: 1rem;
  }
  
  .timeline-marker {
    position: relative;
    width: 30px;
    margin-right: 1rem;
  }
  
  .marker-circle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #e9ecef;
    border: 2px solid #ced4da;
    position: relative;
    z-index: 2;
  }
  
  .marker-line {
    position: absolute;
    top: 20px;
    bottom: -20px;
    left: 50%;
    width: 2px;
    transform: translateX(-50%);
    background-color: #dee2e6;
    z-index: 1;
  }
  
  .marker-line.last-item {
    display: none;
  }
  
  .timeline-content {
    flex: 1;
    padding: 0.5rem 1rem;
    background-color: #f8f9fa;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }
  
  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  .status-eligible {
    background-color: #d4edda;
    color: #155724;
  }
  
  .status-ineligible {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  .status-non-compliant {
    background-color: #fff3cd;
    color: #856404;
  }
  
  .status-pending {
    background-color: #e2e3e5;
    color: #383d41;
  }
  
  .status-info {
    font-size: 0.9rem;
  }
  
  .status-timestamp {
    margin-bottom: 0.5rem;
  }
  
  .status-date {
    color: #495057;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  
  .status-time-exact {
    color: #6c757d;
    font-size: 0.75rem;
    font-family: monospace;
    background-color: #f8f9fa;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    width: fit-content;
  }
  
  .status-user {
    color: #495057;
    margin-bottom: 0.25rem;
  }
  
  .status-note {
    color: #495057;
    padding: 0.5rem;
    background-color: #ffffff;
    border-radius: 4px;
    border-left: 3px solid #dee2e6;
  }
</style>