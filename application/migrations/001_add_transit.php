<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class Migration_Add_transit extends CI_Migration {

  public function up() {
    
    $this->dbforge->add_field(array(
      'id' => array('type' => 'INT', 'constraint' => 5, 'unsigned' => TRUE, 'auto_increment' => TRUE),
      'slug' => array('type' => 'VARCHAR','constraint' => 20, 'null' => FALSE),
      'user' => array('type' => 'VARCHAR','constraint' => 40, 'null' => FALSE),
      'token' => array('type' => 'VARCHAR','constraint' => 40, 'null' => FALSE),
      'title' => array('type' => 'VARCHAR', 'constraint' => 120, 'null' => FALSE),
      'stations' => array('type' => 'TEXT'),
      'date_created' => array('type' => 'INT', 'unsigned' => TRUE, 'constraint' => 10, 'null' => FALSE),
      'date_modified' => array('type' => 'INT', 'unsigned' => TRUE, 'constraint' => 10, 'null' => FALSE)
    ));
    
    $this->dbforge->add_key('id', TRUE);
    $this->dbforge->add_key('slug');
    $this->dbforge->add_key('user');
    $this->dbforge->add_key('token');

    $this->dbforge->create_table('transit');    
  }

  public function down() {
    $this->dbforge->drop_table('transit');
  }
  
}