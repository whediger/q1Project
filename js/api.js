$(document).ready(function(){

  $.get('http://api.nal.usda.gov/ndb/list?format=json&lt=g&sort=n&api_key=rz0uHRvuUkaP6TxlqLvFaVKYKlbUgcjYMOOZE51u ', function(data){
    var itemLength = data.list.item.length;
    for ( i = 0; i < itemLength; i++ ) {
      //console.log(data.list.item[i]);
        //console.log(data.list.item[i].name);
        $('#selectCatagory').append('<option'
          + ' value="' + data.list.item[i].name
          + '">' + data.list.item[i].name
          + '</option>')
    }
    return data;
  }).then(function(data){
    //get selected catagory and catagory id
    //then pass to the next promise
    var catagory = ["", ""];

    $('#selectCatagory').on('click', function(){
      $('.typeahead').typeahead('destroy');

    });

    $('#selectCatagory').on('change', function(){
      catagory[0] = $('#selectCatagory').val();
      for ( i = 0; i < data.list.item.length; i++ ) {
        if (data.list.item[i].name === catagory[0] ){
          catagory[1] = data.list.item[i].id;
          //console.log(catagory);
        }
      }

      $.get('http://api.nal.usda.gov/ndb/search/?format=json&fg='+ catagory[1] + '&sort=n&max=1500&offset=0&api_key=rz0uHRvuUkaP6TxlqLvFaVKYKlbUgcjYMOOZE51u', function(data){
        var foods = [];
        var nutrition = {};

        foodlength = data.list.item.length;
        for ( i = 0; i < foodlength; i++){
          foods[i] = data.list.item[i].name;
        }
        // console.log(data);

        //send ndbno to get nutrional data
        function getNutritionalData(ndbnoIn){
          $.get('http://api.nal.usda.gov/ndb/reports/?ndbno='+ ndbnoIn +'&type=b&format=json&api_key=rz0uHRvuUkaP6TxlqLvFaVKYKlbUgcjYMOOZE51u', function(data){
            nutrition = data;
              console.log(data);
              return nutrition
          });
          return nutrition
        }

        //get food item id from fooditem name
        $('#submit').on('click', function(event){
          event.preventDefault();
          id = "";
          nameIn = $('#foodText').val();
          for ( i = 0; i < foodlength; i++) {
            if ( nameIn === data.list.item[i].name ){
              id = data.list.item[i].ndbno;
            }
          }
          console.log("catagory: " +
                        catagory[1] +
                      " food id: " +
                      id);
          getNutritionalData(id)
        });

        //typeahead +=========> typeahead
        var substringMatcher = function(strs) {
            return function findMatches(q, cb) {
              var matches, substringRegex;

              // an array that will be populated with substring matches
              matches = [];

              // regex used to determine if a string contains the substring `q`
              substrRegex = new RegExp(q, 'i');

              // iterate through the pool of strings and for any string that
              // contains the substring `q`, add it to the `matches` array
              $.each(strs, function(i, str) {
                if (substrRegex.test(str)) {
                  matches.push(str);
                }
              });

              cb(matches);
            };
          };

          $('#scrollable-dropdown-menu .typeahead').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
          },
          {
            name: 'foods',
            limit: 10,
            source: substringMatcher(foods)
          });
        //console.log(data.list.item[200]);
      });
    });

    // $('.typeahead').on('focus', function(){
    //   $('.typeahead').typeahead('destroy');
    // });

  }).then(function(nutrition){


    });



});
