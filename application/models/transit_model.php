<?php

class Transit_model extends CI_Model {

  function __construct() {
    parent::__construct();
  }
  
  function get_entry_by_slug($slug){
    $query = $this->db->get_where('transit', array('slug' => $slug), 1);
    $result = $query->result();    
    return (count($result) > 0) ? $result[0] : FALSE;
  }
  
  function get_entry_by_token($token){
    $query = $this->db->get_where('transit', array('token' => $token), 1);
    $result = $query->result();
    return (count($result) > 0) ? $result[0] : FALSE;
  }
  
  function get_entries_by_user($user){
    $query = $this->db->get_where('transit', array('user' => $user));
    return $query->result();
  }
  
  function insert_entry($data) {  
    $this->db->insert('transit', $data);
  }
  
  function update_entry($id, $data) {
    $this->db->update('transit', $data, array('id' => $id));
  }
  
}