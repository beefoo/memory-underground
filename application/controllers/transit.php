<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Transit extends CI_Controller {
  
  public function show($slug) {
    if (!$transit = $this->Transit->get_entry_by_slug($slug)) {
      $this->error();
      return false;
    }
    
    if ($this->input->is_ajax_request()) {
      $data['title'] = $transit->title;
      $data['stations'] = json_decode($transit->stations);
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
    if (!$transit = $this->Transit->get_entry_by_token($token)) {
      $this->error();
      return false;
    }
    
    $data['title'] = 'Edit Map';
    $data['javascript'] = $this->load->view('transit/_add-javascript', null, TRUE);
    $this->load->view('shared/head', $data);
    $this->load->view('transit/add', $data);
    $this->load->view('shared/foot', $data);
  }
  
  public function save($slug){
    $this->load->model('Transit');
    
    $transit = $this->Transit->get_entry_by_slug($slug);    
    $data = $this->_getData();
    
    if ($transit){
      $this->Transit->update_entry($transit->id, $data);
      
    } else {
      $this->Transit->insert_entry($data);
    }    
  }
  
  public function error(){
    
  }
  
  private function _cleanData($data){
    foreach($data as $key => &$value){
      $value = strip_tags($value);
    }
    return $data;
  }
  
  private function _getData(){
    $data = array();
    $data["title"] = $this->input->post("title");
    $data["stations"] = $this->input->post("stations");
    return $this->_cleanData($data);
  }
  
}

/* End of file home.php */
/* Location: ./application/controllers/transit.php */