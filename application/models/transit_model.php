<?php

class Transit_model extends CI_Model {

  function __construct() {
    parent::__construct();
  }
  
  function accessibleFields(){
    return array("slug", "token", "user", "title", "stations", "legend", "labels");
  }
  
  function getEntryBySlug($slug){
    $query = $this->db->get_where('transit', array('slug' => $slug), 1);
    $result = $query->result();    
    return (count($result) > 0) ? $result[0] : FALSE;
  }
  
  function getEntryByToken($token){
    $query = $this->db->get_where('transit', array('token' => $token), 1);
    $result = $query->result();
    return (count($result) > 0) ? $result[0] : FALSE;
  }
  
  function getEntriesByUser($user){
    $query = $this->db->get_where('transit', array('user' => $user));
    return $query->result();
  }
  
  function insertEntry($data) {
    $data['date_created'] = time(); 
    $this->db->insert('transit', $data);
  }
  
  function updateEntry($id, $data) {
    $data['date_modified'] = time();
    $this->db->update('transit', $data, array('id' => $id));
  }
  
}