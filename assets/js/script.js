var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// delegating clicks to <p>'s parent <ul>, as <p> is created dynamically. So we are offsetting the eventListener to an element that always exists. If you want to check which child element triggered the event you can use if(event.target.matches('.task')) {};
$('.list-group').on('click', 'p', function(){
  var text = $(this)
    // gets the inner text content of current element
    .text()
    // gets rid of extra white space before and after
    .trim();

    // $('<textarea>') creates new textares element, whereas $('textarea') tells jQuery to find all existing <textarea> elements
  var textInput = $('<textarea>')
    .addClass('form-control')
    .val(text);

  // replaceexisitng <p> element with new <textarea>
  $(this).replaceWith(textInput);

  // automatically highlight input box for better UX. Considered in focus event
  textInput.trigger('focus');
});

// we want the textarea to revert back when it goes out of focus. The blur event will trigger as soon as the user interacts with anything other than the <textarea> element
$('.list-group').on('blur', 'textarea', function(){
  // get textarea's current value
  var text = $(this)
    .val()
    trim();

  // get parent ul's id attribute
  var status = $(this)
    .closest('.list-group')
    .attr('id')
    replace('list-', '');

  // get the task's position in the list of other li elements
  var index = $(this)
    .closest('.list-group-item')
    .index();

   /*  tasks is an object.
      - tasks[status] returns an array (e.g., toDo).
      -  tasks[status][index] returns the object at the given index in the array.
      - tasks[status][index].text returns the text property of the object at the given index. */
    // have to update for localStorage
  tasks[status][index].text = text;
  saveTasks();

// recreate p element
var taskP = $('<p>')
  .addClass('m-1')
  .text(text);

  // replace textarea with p element
  $(this).replaceWith(taskP);
});

// due date was clicked
$(".list-group").on("click", "span", function() {
  // get current text
  var date = $(this)
    .text()
    .trim();

  // create new input element
  var dateInput = $("<input>")
  // setting the attribute type='text'
  /* attr() can get an attribute when followed by one argument: attr('id)
  Or can set an attribute if followed by two arguments: attr('type', 'text') */
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  // swap out elements
  $(this).replaceWith(dateInput);

  // automatically focus on new element
  dateInput.trigger("focus");
});

// value of due date was changed
$(".list-group").on("blur", "input[type='text']", function() {
  // get current text
  var date = $(this)
    .val()
    .trim();

  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);
});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// make ul elements sortable
$('.card .list-group').sortable({
  connectWith: $('.card .list-group'),
  scroll: false,
  tolerance: 'pointer',
  /*  tells jQuery to create a copy of the dragged element and move the copy instead of the original. This is necessary to prevent click events from accidentally triggering on the original element */
  helper: 'clone',
  activate: function(event){
    console.log('activate', this);
  },
  deactivate: function(event){
    console.log('deactivate, this');
  },
  over: function(event) {
    console.log("over", event.target);
  },
  out: function(event) {
    console.log("out", event.target);
  },
  update: function(event) {
    // array to store the task data in
var tempArr = [];
    


// loop over current set of children in sortable list
$(this).children().each(function() {
  var text = $(this)
  // .find()  Get the descendants of each element in the current set of matched elements
    .find("p")
    // .text()  Get the combined text contents of each element in the set of matched elements
    .text()
    .trim();

  var date = $(this)
    .find("span")
    .text()
    .trim();

  // add task data to the temp array as an object
  tempArr.push({
    text: text,
    date: date
  });
});
console.log(tempArr);

// trim down list's ID to match object property
var arrName = $(this)
  .attr("id")
  .replace("list-", "");

// update array on tasks object and save
tasks[arrName] = tempArr;
saveTasks();

  }
});

$('#trash').droppable({
  // what items are accepted to be dropped
  accept: '.card .list-group-item',
  // when is an item hovering and when droppable
  tolerance: 'touch',
  // Triggered when an accepted draggable is dropped on the droppable
  // ui is a function parameter that is an obkect, containing a property called draggable. Draggable represents the draggable element
  drop: function(event, ui) {
    console.log('drop');
    ui.draggable.remove();
  },
  // Triggered when an accepted draggable is dragged over the droppable
  over: function(event, ui) {
    console.log("over");
  },
  // Triggered when an accepted draggable is dragged out of the droppable
  out: function(event, ui) {
    console.log("out");
  }
});

// load tasks for the first time
loadTasks();


