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
    //todo----------need to make this respond to ndbno number
    $.get('http://api.nal.usda.gov/ndb/reports/?ndbno=01009&type=b&format=json&api_key=rz0uHRvuUkaP6TxlqLvFaVKYKlbUgcjYMOOZE51u', function(data){

      //takes data and returns array of Measurement types
      function getMeasurements(dataIn){
        var measurements = [];
        //note: add conditional
        var measureLength = dataIn.report.food.nutrients[1].measures.length;
        for ( i = 0; i < measureLength; i++){
          measurements[i] = dataIn.report.food.nutrients[1].measures[i].label;
        }
        return measurements;
      }

      //takes data, amount as an int-(i.e. 2.5), and measure type to match
      //string of available measurement types from api
      //returns nutrient name, value for calculated amount of meassurement
      //and the unit that the resulting amount of nutrient is in.
      function calculateNutrients(dataIn, amountIn, measureIn){
        var results = [];
        var unit = "";
        var nutriVal = "";
        var nutriName = "";

        nutrientsLength = data.report.food.nutrients.length;
        measureLength = data.report.food.nutrients[i].measures.length;

        if (!Math.round10) {
          Math.round10 = function(value, exp) {
            return decimalAdjust('round', value, exp);
          };
        }

        function decimalAdjust(type, value, exp) {
          // If the exp is undefined or zero...
          if (typeof exp === 'undefined' || +exp === 0) {
            return Math[type](value);
          }
          value = +value;
          exp = +exp;
          // If the value is not a number or the exp is not an integer...
          if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
          }
          // Shift
          value = value.toString().split('e');
          value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
          // Shift back
          value = value.toString().split('e');
          return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
        }


        for ( i = 0; i < nutrientsLength; i++){

            unit = data.report.food.nutrients[i].unit;
            nutriName =  data.report.food.nutrients[i].name;

            for ( ii = 0; ii < measureLength; ii++ ){
              if (data.report.food.nutrients[i].measures[ii].label === measureIn){
                  nutriVal = Math.round10(amountIn * (data.report.food.nutrients[i].measures[ii].value), -2);
              }
            }
          results[i] = {
            name: nutriName,
            value: nutriVal,
            unit: unit
          }
        }
        return results;
      }

      //test measure function
      console.log(getMeasurements(data));

      //test nutrient function
      console.log(calculateNutrients(data, 1.5, "cup, diced"));
    });
    //get catagory listener when user selects it
    $('#selectCatagory').on('change', function(){
      catagory[0] = $('#selectCatagory').val();
      for ( i = 0; i < data.list.item.length; i++ ) {
        if (data.list.item[i].name === catagory[0] ){
          catagory[1] = data.list.item[i].id;
          //console.log(catagory);
        }
      }

      //get list of foods a particular catagory
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

        //create food amount user input on typeahead select or change.

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

          //getFoodData(), returns foodData
          //get nutrientData(), returns nutrient data
          //displayNutrientData(), creates divs to diplay nutrient data

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


  });//then after slecting foodgroup

});
