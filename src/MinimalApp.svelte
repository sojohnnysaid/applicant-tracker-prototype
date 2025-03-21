<script>
  console.log('MinimalApp component script executed');
  let counter = 0;
  
  function increment() {
    counter += 1;
    console.log('Counter incremented to', counter);
  }
</script>

<main>
  <h1>Minimal Svelte App</h1>
  <p>Counter: {counter}</p>
  <button on:click={increment}>Increment</button>
</main>

<style>
  main {
    text-align: center;
    padding: 2em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    font-size: 4em;
    font-weight: 100;
  }

  button {
    background: #ff3e00;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
  }
</style>