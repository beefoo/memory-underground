<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Transit extends CI_Controller {
  
  public function __construct() {
    parent::__construct();
    
    $this->load->model('transit_model');
  }
  
  public function show($slug) {
    if (!$transit = $this->transit_model->getEntryBySlug($slug)) {
      redirect("/");
      return false;
    }
    
    $data['title'] = $transit->title;
    $data['javascript'] = $this->load->view('transit/_show-javascript', null, TRUE); 
    $this->load->view('shared/head', $data);
    $this->load->view('transit/show', $data);
    $this->load->view('shared/foot', $data);
  }
  
  public function demo(){
    $data['title'] = "Demo";
    $data['javascript'] = $this->load->view('transit/_show-javascript', null, TRUE); 
    $this->load->view('shared/head', $data);
    $this->load->view('transit/show', $data);
    $this->load->view('shared/foot', $data);
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
      redirect("/maps/add");
      return false;
    }
    
    $data['title'] = 'Editing ' . $transit->title;
    $data['javascript'] = $this->load->view('transit/_add-javascript', null, TRUE);
    $this->load->view('shared/head', $data);
    $this->load->view('transit/add', $data);
    $this->load->view('shared/foot', $data);   
  }
  
}

/* End of file transit.php */
/* Location: ./application/controllers/transit.php */