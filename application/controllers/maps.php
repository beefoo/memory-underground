<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Maps extends CI_Controller {
  
  public function add() {
    $data['title'] = 'Build A Map';
    $data['javascript'] = $this->load->view('maps/_javascript', null, TRUE); 
    $this->load->view('shared/head', $data);
    $this->load->view('maps/add', $data);
    $this->load->view('shared/foot', $data);
  }
  
  public function edit($id) {
    $data['title'] = 'Build A Map';
    $data['javascript'] = $this->load->view('maps/_javascript', null, TRUE);
    $this->load->view('shared/head', $data);
    $this->load->view('maps/add', $data);
    $this->load->view('shared/foot', $data);
  }
  
  public function show($id) {
    $data['title'] = 'Map';
    $data['javascript'] = $this->load->view('maps/_javascript', null, TRUE); 
    $this->load->view('shared/head', $data);
    $this->load->view('maps/show', $data);
    $this->load->view('shared/foot', $data);
  }
  
}

/* End of file home.php */
/* Location: ./application/controllers/home.php */