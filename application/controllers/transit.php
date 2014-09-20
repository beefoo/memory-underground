<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Transit extends CI_Controller {
  
  public function __construct() {
    parent::__construct();
    
    $this->load->model('transit_model');
  }
  
  public function show($slug) {
    if (!$transit = $this->transit_model->getEntryBySlug($slug)) {
      $this->error();
      return false;
    }
    
    if ($this->input->is_ajax_request()) {
      $data = $transit;
      $data->stations = json_decode($transit->stations);
      echo json_encode($data);
      
    } else {
      $data['title'] = $transit->title;
      $data['javascript'] = $this->load->view('transit/_show-javascript', null, TRUE); 
      $this->load->view('shared/head', $data);
      $this->load->view('transit/show', $data);
      $this->load->view('shared/foot', $data);
    }
  }
  
  public function add() {
    $data['title'] = 'Build A Map';
    $data['javascript'] = $this->load->view('transit/_add-javascript', null, TRUE); 
    $this->load->view('shared/head', $data);
    $this->load->view('transit/add', $data);
    $this->load->view('shared/foot', $data);
  }
  
  public function edit($token) {
    if (!$transit = $this->transit_model->getEntryByToken($token)) {
      $this->error();
      return false;
    }
    
    if ($this->input->is_ajax_request()) {
      $data = $transit;
      $data->stations = json_decode($transit->stations);
      echo json_encode($data);
      
    } else {
      $data['title'] = 'Editing ' . $transit->title;
      $data['javascript'] = $this->load->view('transit/_add-javascript', null, TRUE);
      $this->load->view('shared/head', $data);
      $this->load->view('transit/add', $data);
      $this->load->view('shared/foot', $data);
    }    
  }
  
  public function save($token){
    $transit = $this->transit_model->getEntryByToken($token);    
    $data = $this->_getData();
    
    if ($transit){
      $this->transit_model->updateEntry($transit->id, $data);
      
    } else {
      $this->transit_model->insertEntry($data);
    }
    
    echo json_encode(array("message" => "success"));
  }
  
  public function user($user){
    $data = $this->transit_model->getEntriesByUser($user);
    echo json_encode($data);
  }
  
  public function error(){
    if ($this->input->is_ajax_request()) {
      echo json_encode(array("message" => "There was an error"));
      
    } else {
      redirect("/maps/add");
    }
  }
  
  private function _cleanInput($value){
    
    if (!is_numeric($value)) $value = strip_tags($value);
    
    return $value;
  }
  
  private function _getData(){
    $fields = $this->transit_model->accessibleFields();
    $data = array();
    
    foreach($fields as $field){
      $data[$field] = $this->_cleanInput( $this->input->get_post($field) );
    }
    
    return $data;
  }
  
}

/* End of file transit.php */
/* Location: ./application/controllers/transit.php */