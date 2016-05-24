$(document).ready(function(){
  //get food group catagories.
  $.get('https://api.nal.usda.gov/ndb/list?format=json&lt=g&sort=n&api_key=rz0uHRvuUkaP6TxlqLvFaVKYKlbUgcjYMOOZE51u ', function(data){
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

    var catagory = ["", ""];

    //reset typahead when user changes selected foodgroup
    $('#selectCatagory').on('click', function(){
      $('.typeahead').typeahead('destroy');
    });

    //gets selected food value when user selects suggested input
    $('.typeahead').on('typeahead:select', function() {
      var typeVal = $(this).val();
      //console.log("typeahead suggestion selected: "
        // + typeVal);
    });

    // get Measure data(use to create measure input fields)
    // same query gets nutrition data "basic" report returns
    // most asked for nutrients and ones included on nutritional facts
    // pannel on the back of packages
    $.get('http://api.nal.usda.gov/ndb/reports/?ndbno=01009&type=b&format=json&api_key=rz0uHRvuUkaP6TxlqLvFaVKYKlbUgcjYMOOZE51u', function(data){

      //takes data and returns array of Measurements used
      function getMeasurements(dataIn){
        var measurements = [];
        //note: add conditional
        var measureLength = dataIn.report.food.nutrients[1].measures.length;
        for ( i = 0; i < measureLength; i++){
          measurements[i] = dataIn.report.food.nutrients[1].measures[i].label;
        }
        return measurements;
      }

      //test measure function
      console.log(getMeasurements(data));

      //turn into nutient function
      for ( i = 0; i < data.report.food.nutrients.length; i++) {
        console.log("nutrient: " + data.report.food.nutrients[i].name);
      }
      console.log(data.report.food.nutrients[1]);
    });
    //get catagory when user selects it
    $('#selectCatagory').on('change', function(){
      catagory[0] = $('#selectCatagory').val();
      for ( i = 0; i < data.list.item.length; i++ ) {
        if (data.list.item[i].name === catagory[0] ){
          catagory[1] = data.list.item[i].id;
          //console.log(catagory);
        }
      }

      //get info for a particular food
      $.get('http://api.nal.usda.gov/ndb/search/?format=json&fg='+ catagory[1] + '&sort=n&max=1500&offset=0&api_key=rz0uHRvuUkaP6TxlqLvFaVKYKlbUgcjYMOOZE51u', function(data){
        var foods = [];
        var nutrition = {};

        foodlength = data.list.item.length;
        for ( i = 0; i < foodlength; i++){
          foods[i] = data.list.item[i].name;
        }
        // console.log(data);



        function getNdbno(foodName) {
          var ndbnoOut = "";
          for ( i = 0; i < foodlength; i++) {
            if ( nameIn === data.list.item[i].name ){
              ndbnoOut = data.list.item[i].ndbno;
            }
          }
          return ndbnoOut;
        }

        //takes ndbno returns nutrional data
        function getNutritionalData(ndbnoIn){
          $.get('http://api.nal.usda.gov/ndb/reports/?ndbno='+ ndbnoIn +'&type=b&format=json&api_key=rz0uHRvuUkaP6TxlqLvFaVKYKlbUgcjYMOOZE51u', function(data){
            nutrition = data;
            nutroLength = data.report.food.nutrients.length;
            //console.log(data);
              //add elements to modal-body
              for ( i = 1; i < nutroLength; i ++ ) {
                if (data.report.food.nutrients[i].value > 0 ) {
                  $('.modal-body').append('<div class="nutriRow"><div class="nutrientTitle">'
                  + data.report.food.nutrients[i].name
                  + '</div><div class="nutriValue">'+ data.report.food.nutrients[i].value +' '
                  +data.report.food.nutrients[i].unit + '</div></div>' );
                }
              }
              // console.log(data.report.food.nutrients[i].name);
          });
        }

        //get food item id from fooditem name in input
        $('#submit').on('click', function(event){
          event.preventDefault();
          var id = "";

          nameIn = $('#foodText').val();

          id = getNdbno(nameIn);

          // console.log("catagory: " +
          //               catagory[1] +
          //             " food id: " +
          //             id);


          getNutritionalData(id);
          //open new window for results
          $('#foodTitle').text(nameIn);
        });


        //typeahead +=========> typeahead
        //-----------------------
        //add scroll to selected suggestion on popup when user presses arrow keys
        // var container = $('tt-dataset'),
        //     scrollTo = $('tt-cursor');
        //
        // container.animate({
        //     scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
        // });

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
            limit: 30,
            source: substringMatcher(foods)
          });
        //console.log(data.list.item[200]);
      });
    });


  }).then(function(nutrition){

    });

});
