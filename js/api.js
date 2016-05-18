$(document).ready(function(){

var itemKey = "";

  $.get('http://api.nal.usda.gov/ndb/list?format=json&lt=g&sort=n&api_key=rz0uHRvuUkaP6TxlqLvFaVKYKlbUgcjYMOOZE51u ', function(data){
    var itemLength = data.list.item.length;
    for ( i = 0; i < itemLength; i++ ) {
      console.log(data.list.item[i]);
        console.log(data.list.item[i].name);
        $('#selectCatagory').append('<option'
          + ' value="' + data.list.item[i].name
          + '">' + data.list.item[i].name
          + '</option>')
    }
    return data;
  }).then(function(data){
    $('#selectCatagory').on('change', function(){
      console.log($('#selectCatagory').val());
      // $('main').append('<p></p>');
      // $('main p:last-child').text($('#selectCatagory').val());
    });

    $('#submit').on('click', function(event){
      event.preventDefault();
    });//do I really need a whole function for this?

  });
  // need to get the item id number and then pass it back over to get nutritional information. Two seperate requests.
});
