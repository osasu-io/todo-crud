// okay so this grabs all the buttons with class "toggle-complete"
var toggleBtns = document.getElementsByClassName("toggle-complete");
var deleteBtns = document.getElementsByClassName("delete");

// loop through all the complete buttons and add a click event
Array.from(toggleBtns).forEach(function(element) {
  element.addEventListener('click', function() {
    const task = this.dataset.task // grabbing the task name from the button
    const completed = this.dataset.completed // this is like "true" or "false" string

    fetch('todos', {
      method: 'put',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: task,
        completed: completed
      })
    }).then(response => {
      if (response.ok) return response.json()
    }).then(data => {
      console.log(data)
      window.location.reload(true)
    })
  });
});

// delete todo logic
Array.from(deleteBtns).forEach(function(element) {
  element.addEventListener('click', function() {
    const task = this.dataset.task // getting the task text

    fetch('todos', {
      method: 'delete',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: task
      })
    }).then(function(response) {
      window.location.reload()
    })
  });
});