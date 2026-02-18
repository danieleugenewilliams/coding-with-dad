// Custom Blockly block definitions for the kids coding prototype

// Define movement blocks
Blockly.Blocks['move_forward'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("move forward");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#5ba55b');
    this.setTooltip("Move the robot forward one step");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['turn_right'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("turn right");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#5ba55b');
    this.setTooltip("Turn the robot 90 degrees to the right");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['turn_left'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("turn left");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#5ba55b');
    this.setTooltip("Turn the robot 90 degrees to the left");
    this.setHelpUrl("");
  }
};

// JavaScript code generators for custom blocks
Blockly.JavaScript['move_forward'] = function(block) {
  var code = 'moveForward();\n';
  return code;
};

Blockly.JavaScript['turn_right'] = function(block) {
  var code = 'turnRight();\n';
  return code;
};

Blockly.JavaScript['turn_left'] = function(block) {
  var code = 'turnLeft();\n';
  return code;
};

// Override the repeat block generator to work with our interpreter
Blockly.JavaScript['controls_repeat_ext'] = function(block) {
  var repeats = Blockly.JavaScript.valueToCode(block, 'TIMES', Blockly.JavaScript.ORDER_ATOMIC);
  var branch = Blockly.JavaScript.statementToCode(block, 'DO');

  if (repeats === '') {
    repeats = '0';
  }

  var code = 'for (var count = 0; count < ' + repeats + '; count++) {\n' + branch + '}\n';
  return code;
};