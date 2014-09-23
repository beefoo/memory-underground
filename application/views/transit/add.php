<div id="transit-add" class="form-wrapper">
  
  <div class="form-tab-links">
    <a href="#people" class="tab-link active">People <small>(Trains)</small></a>
    <a href="#memories" class="tab-link">Memories <small>(Stations)</small></a>
    <a href="#finish" class="tab-link">Finish &amp; View</a>
  </div>
  
  <div class="form-tabs">
    
    <div id="people" class="tab active">      
      <label for="person-name">
        Enter Names of People You Had Memories With<br />
        <small>These will be your train lines. For best results, add between 5 and 20.</small>
      </label>
      <div class="input-group">
        <input type="text" name="person-name" class="person-input" placeholder="e.g. Annie, Brandon, Catherine" />
        <a href="#add-person" class="person-add-link">Add</a>
      </div>
      <div id="add-person-success-message" class="message success hide">
        Keep adding names of people, then start adding memories by clicking <em>add a memory</em> next to each person. For best results,
        add at least 2 memories per person.
      </div>
      <ul id="people-list" class="tab-list"></ul>
    </div>
    
    <div id="add-memory" class="tab">
      <form id="memory-form" data-memory-id="">
        <label for="name">Enter A Memory<br /><small>Keep it short, this will be the name of a train station.</small></label>
        <input type="text" name="name" data-show="#memory-people-input" placeholder="e.g. 21st birthday, Winter camping, Mexico Honeymoon" maxlength="50" />
        <label for="people">Who Was In This Memory?<br /><small>For best results, most memories should include more than one person</small></label>
        <ul id="people-select-list" class="people-select-list">
          <li><a href="#person-input-group" class="toggle-element button" data-focus="#add-memory-person-input" title="add another person">+</a></li>
        </ul>
        <div id="person-input-group" class="input-group hide">
          <input id="add-memory-person-input" type="text" name="person-name" class="person-input" placeholder="Enter another name" data-active="1" />
          <a href="#add-person" class="person-add-link">Add Person</a>
        </div>
        <button type="submit" class="expand">Save Memory</button>
      </form>
    </div>
    
    <div id="memories" class="tab">      
      <div id="add-memory-success-message" class="message success">
        <strong>Tips:</strong>
        <ul>
          <li>Add memories until you are ready to see your map, then click the <em>Finish &amp; View</em> tab above.</li>
          <li>For best results you should have between 10 and 100 memories in total.</li>
          <li>Memories should be listed in chronological order; you can drag memories up or down to change their order.</li>
        </ul>         
      </div>        
      <a href="#add-memory" class="tab-link button expand add-memory-button"><i class="icon icon-plus"></i> Add Another Memory</a>
      <ul id="memories-list" class="tab-list sortable"></ul>
    </div>
    
    <div id="finish" class="tab">
      <form id="transit-form">
        <label for="title">Give A Title To Your Map</label>
        <input type="text" name="title" placeholder="e.g. Jane's 2014 Memory Map" maxlength="50" />
        <div class="button-group">
          <button id="button-legend" type="button" class="toggle-active-link active">Show Map Legend <i class="icon icon-checkmark"></i></button>
          <button id="button-labels" type="button" class="toggle-active-link active">Show Map Labels <i class="icon icon-checkmark"></i></button>
        </div>
        <button type="submit" class="expand"><i class="icon icon-save"></i> Save Map &amp; View Result</button>
      </form>
    </div>   
    
  </div> <!-- / form-tabs -->
  
</div> <!-- / form-wrapper -->

<div id="transit-toolbar" class="toolbar">
  
  <a id="transit-list-link" class="toolbar-link hide">
    My Memory Maps <i class="icon icon-triangle-down"></i>
    <ul id="transit-list" class="toolbar-list"></ul>
  </a>
  
  <a href="/" class="toolbar-link" title="About this project"><i class="icon icon-info"></i></a>

</div>

<!-- Templates -->
<script type="text/template" id="person-list-item">
  <div class="content">
    <div class="remove"><a href="#remove-person" class="remove-link icon icon-remove" title="remove this person"></a></div>
    <div class="name"><input type="text" name="name" value="<%- name %>" class="person-edit" /></div>
    <div class="list" title="<%= stationString %>"><%= stationString %></div>
    <div class="action"><a href="#add-memory" class="tab-link button" data-name="<%- name %>">add a memory</a></div>
  </div>
</script>

<script type="text/template" id="person-select-item">
  <a href="#toggle" data-name="<%- name %>" class="toggle-select-link button <% if (active) { %>active<% } %>">
    <i class="icon icon-checkmark"></i> <%- name %>
  </a>
</script>

<script type="text/template" id="memory-list-item">
  <div class="content">
    <div class="remove"><a href="#remove-memory" class="remove-link icon icon-remove" title="remove this memory"></a></div>
    <div class="name sortable-handle"><%- name %></div>
    <div class="list" title="<%= lineString %>"><%= lineString %></div>
    <div class="action"><a href="#edit" class="edit-link button" data-id="<%- id %>">edit memory</a></div>
  </div>
</script>
