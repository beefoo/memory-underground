<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Memory Underground - Convert Your Memories Into A Subway Map<?=(isset($title)&&$title)?' - '.$title:''?></title>
  <meta name="description" content="A simple web app that allows you to convert a list of memories with people into a downloadable and printable subway map">
  <meta name="viewport" content="width=device-width, initial-scale=1">  
  <meta name="image_src" content="<?=base_url('assets/img/memoryunderground.jpg')?>">
  <meta property="og:image" content="<?=base_url('assets/img/memoryunderground.jpg')?>" />
  
  <link rel="stylesheet" href="<?=base_url('assets/css/app.css')?>">
</head>
<body class="<?= $this->router->fetch_class() ?>-<?= $this->router->fetch_method() ?>">