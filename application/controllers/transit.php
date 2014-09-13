<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Transit extends CI_Controller {
  
  public function add() {
    $data['title'] = 'Build A Transit Map';
    $data['javascript'] = $this->load->view('transit/_add-javascript', null, TRUE); 
    $this->load->view('shared/head', $data);
    $this->load->view('transit/add', $data);
    $this->load->view('shared/foot', $data);
  }
  
  public function edit($id) {
    $data['title'] = 'Edit Transit Map';
    $data['javascript'] = $this->load->view('transit/_add-javascript', null, TRUE);
    $this->load->view('shared/head', $data);
    $this->load->view('transit/add', $data);
    $this->load->view('shared/foot', $data);
  }
  
  public function show($id) {
    $data['title'] = 'Transit Map';
    $data['javascript'] = $this->load->view('transit/_show-javascript', null, TRUE); 
    $this->load->view('shared/head', $data);
    $this->load->view('transit/show', $data);
    $this->load->view('shared/foot', $data);
  }
  
}

/* End of file home.php */
/* Location: ./application/controllers/transit.php */