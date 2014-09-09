<div id="transit-add" class="form-wrapper">
  
  <div class="form-tab-links">
    <a href="#people" class="tab-link">People <small>(Trains)</small></a>
    <a href="#memories" class="tab-link">Memories <small>(Stations)</small></a>
    <a href="#view" class="tab-link">View Result</a>
  </div>
  
  <div class="form-tabs">
    
    <div id="people" class="form-tab">      
      <label for="person-name">Type Names of People You Had Memories With<br />
        <small>For an optimal map, add between 5 and 20 people with at least 2 memories per person</small>
      </label>
      <div class="input-group">
        <input type="text" name="person-name" placeholder="e.g. Annie, Brandon, Catherine" />
        <a href="#add-person" class="person-add-link">Add</a>
      </div>
      <ul id="people-list" class="tab-list"></ul>
    </div>
    
    <div id="add-memory" class="form-tab">
      <form id="memory-form">
        <label for="title">Memory Label<br /><small>Keep it short, this will be the name of a train station</small></label>
        <input type="text" name="title" placeholder="e.g. 21st birthday, Winter camping, Mexico Honeymoon" maxlength="40" />
        <label for="people">Who Was In This Memory?<br /><small>For an optimal map, try to choose memories with more than one person in it</small></label>
        <div id="people-select-wrapper" class="select-wrapper"></div>
        <div class="input-group">
          <input type="text" name="person-name" placeholder="Another name" />
          <a href="#add-person" class="person-add-link">Add Person</a>
        </div>
        <button type="submit">Submit Memory</button>
      </form>
    </div>
    
    <div id="memories" class="form-tab">
      <a href="#add-memory" class="button tab-link">Add A Memory</a>
      <ul id="memories-list" class="tab-list"></ul>
    </div>
    
  </div> <!-- / form-tabs -->
  
</div> <!-- / form-wrapper -->
