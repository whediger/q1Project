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

    //get selected catagory and catagory id

    var catagory = ["", ""];

    //reset typahead when user changes selected foodgroup
    $('#selectCatagory').on('click', function(){
      $('.typeahead').typeahead('destroy');
    });

    //gets selected food value when user selects suggested input
    $('.typeahead').on('typeahead:select', function() {
      var typeVal = $(this).val();
    });

    // get Measure data(use to create measure input fields)
    // same query gets nutrition data "basic" report returns
    // most asked for nutrients and ones included on nutritional facts
    // pannel on the back of packages
    //todo----------need to make this respond to ndbno number
    function getNutriData(ndbnoIn){
      $.get('https://api.nal.usda.gov/ndb/reports/?ndbno=' + ndbnoIn + '&type=b&format=json&api_key=rz0uHRvuUkaP6TxlqLvFaVKYKlbUgcjYMOOZE51u', function(data){
        console.log(data);
        //takes data and returns array of Measurement types
        function getMeasurements(dataIn){
          var measurements = [];
          //note: add conditional
          var measureLength = dataIn.report.food.nutrients[1].measures.length;
          if ( measureLength === 0 ){ return measurements[0] = ".22 Lb" };
          for ( i = 0; i < measureLength; i++){
            if ( dataIn.report.food.nutrients[1].measures[i] !== null){
              measurements[i] = {
                qty: dataIn.report.food.nutrients[1].measures[i].qty,
                label: dataIn.report.food.nutrients[1].measures[i].label
              }
            }

          }
          return measurements;
        }

        // adds available measurements to dropdown on UI
        function createMeasurementList(measurements){
          console.log("measurements: ");
          console.log(measurements);
          //measurements object
          // label: name of measurements
          // val: value of label, i.e. (12) for 12 of the label amount.
          //if statement to check for string
          if (Array.isArray(measurements)) {
            for (  i = 0; i < measurements.length; i++){
              $('#measureSelect').append('<option'
                + ' data-label="' + measurements[i].label
                + '" data-qty="' + measurements[i].qty + '">'
                + " " + measurements[i].qty + " " + measurements[i].label
                + '</option>')
            }
          } else {
            $('#measureSelect').append('<option'
              + ' value="' + measurements.label
              + '">' + measurements.label
              + '</option>')
          }
        }

        //takes data, amount as an int-(i.e. 2.5), and measure type to match
        //string of available measurement types from api
        //returns nutrient name, value for calculated amount of meassurement
        //and the unit that the resulting amount of nutrient is in.
        function createNutraModal(nutriListIn) {
          //todo -- this adds elements each time if modal is hidden and then
          //     -- the show nutrients button is pushed again.
          // object in--
          //   name: nutriName,
          //   value: nutriVal, //precalculated for portion
          //   amount: amountIn,
          //   unit: unit

          //note: test nutrient function, using first result key word cheese in dairy

          // todo----refactor following paths
          nutroLength = nutriListIn.length;
          $('.modal-body').append('<h3>('+ $('#units').val()
          + ')  ' + $('#measureSelect').val() + ', Serving</h3>');

          for ( i = 1; i < nutroLength; i ++ ) {
            if ( data.report.food.nutrients[i].value > 0 ) {
              $('.modal-body').append('<div class="nutriRow"><div class="nutrientTitle">'
              + nutriListIn[i].name
              + '</div><div class="nutriValue">'
              + nutriListIn[i].value +' '
              + nutriListIn[i].unit + '</div></div>' );
            }
          }

        }

        function calculateNutrients(qtyIn, amountIn, labelIn){
          console.log("inside calculateNutrients " + amountIn + " " + labelIn);
          console.log(data);
          var results = [];
          var unit = "";
          var nutriVal = "";
          var nutriName = "";
          var measurePath = "";

          if (qtyIn > 0) { amountIn *= qtyIn; }

          nutrientsLength = data.report.food.nutrients.length;

          //if food has measurement properties
          if (data.report.food.nutrients[0].measures.length > 0){
            measureLength = data.report.food.nutrients[0].measures.length;
          } else {
            measureLength = 0;//todo --- possible cause of string forming? try length 1
            console.log("measures = zero");
          }


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

              if (measureLength > 0 ) {
                for ( ii = 0; ii < measureLength; ii++ ){
                  //here
                  if (data.report.food.nutrients[i].measures[ii].label === labelIn){
                      nutriVal = Math.round10(amountIn * (data.report.food.nutrients[i].measures[ii].value), -2);
                      break;
                  }
                }
              } else {
                //if food has no measures return value for 100g of food
                    nutriVal = Math.round10(amountIn * (data.report.food.nutrients[i].value), -2);

              }
            results[i] = {
              name: nutriName,
              value: nutriVal,
              amount: amountIn,
              unit: unit
            }
          }
          createNutraModal(results); //remove after implimenting submit button
          return results;
        }
        //-------------------==========> Measurement input row

      $('#units').keyup(function(event){
          //console.log(event);
          if (checkInp('#units') === false) {
            $('#units').val('');
          }
         });

         //checks for valid numeric input
         //todo----------will not recognize
         //seperatd decimal points (1.2.)
        function checkInp(idIn)
            {
                var x = $(idIn).val();
                var regex=/[(\.{1})0-9]/g;
                if (!x.match(regex))
                {
                    alert("Must input numbers");
                    return false;
                }
            }

        //todo----------the measureSelect value is not the value of the
        //  possible qty of measurement. see >beverages>a>bud light.
        //  there are two possible "oz" one 1oz, and one 12oz.
        //test measure function
        console.log("get measurements: " + getMeasurements(data));
        createMeasurementList(getMeasurements(data));
        $('#submit').on('click', function(){
          // console.log('data from element!');
          console.log($('#measureSelect option:selected').attr('data-qty'));
          var qty = $('#measureSelect option:selected').attr('data-qty');
          console.log($('#measureSelect option:selected').attr('data-label'));
          var label = $('#measureSelect option:selected').attr('data-label');
          //console.log($('#units').val(), $('#measureSelect').val());
          var unitsOut = $('#units').val();

          calculateNutrients(qty, unitsOut, label);
        });
      });//get nutrient data function
    }//function getnutridata

    //catagory listener assigns when user selects it
    $('#selectCatagory').on('change', function(){
      catagory[0] = $('#selectCatagory').val();
      for ( i = 0; i < data.list.item.length; i++ ) {
        if (data.list.item[i].name === catagory[0] ){
          catagory[1] = data.list.item[i].id;
          //console.log(catagory);
        }
      }

      //get list of foods for a particular catagory
      $.get('https://api.nal.usda.gov/ndb/search/?format=json&fg='+ catagory[1] + '&sort=n&max=1500&offset=0&api_key=rz0uHRvuUkaP6TxlqLvFaVKYKlbUgcjYMOOZE51u', function(data){
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

        //todo---------- takes 2D array, 1) array of ingredient arrays
        // 2) array of objects containing ingredient deatails.
        //builds modal for displaying recipe data.




        //create food amount user input on typeahead select or change.

        //get food item id from fooditem name in input
        $('.typeahead').on('typeahead:select', function(event){
          //event.preventDefault();
          var id = "";

          nameIn = $('#foodText').val();

          id = getNdbno(nameIn);

          getNutriData(id);
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

      });//get list of foods
    });//select catagory on change
  });//get data
});
