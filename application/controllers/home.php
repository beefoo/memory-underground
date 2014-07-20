<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Home extends CI_Controller {
  
	public function index() {
	  $data['title'] = 'Home';
    $data['javascript'] = $this->load->view('home/_javascript', null, TRUE); 
		$this->load->view('shared/head', $data);
    $this->load->view('home/index', $data);
    $this->load->view('shared/foot', $data);
	}
  
}

/* End of file home.php */
/* Location: ./application/controllers/home.php */