import React, { useRef, useEffect, useState } from 'react';
// @ts-ignore - Blockly doesn't have perfect TypeScript support
import * as Blockly from 'blockly';
// @ts-ignore
import { javascriptGenerator, Order } from 'blockly/javascript';

interface BlocklyWorkspaceProps {
  onCodeChange: (code: string) => void;
  onWorkspaceReady: (workspace: Blockly.WorkspaceSvg) => void;
}

export const BlocklyWorkspace: React.FC<BlocklyWorkspaceProps> = ({
  onCodeChange,
  onWorkspaceReady
}) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const [workspace, setWorkspace] = useState<Blockly.WorkspaceSvg | null>(null);

  useEffect(() => {
    if (!blocklyDiv.current) return;

    // Define custom blocks
    const defineCustomBlocks = () => {
      Blockly.Blocks['move_forward'] = {
        init: function() {
          this.appendDummyInput()
            .appendField("move forward");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(120);
          this.setTooltip("Move the character forward one step");
          this.setHelpUrl("");
        }
      };

      Blockly.Blocks['turn_right'] = {
        init: function() {
          this.appendDummyInput()
            .appendField("turn right");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(120);
          this.setTooltip("Turn the character 90 degrees to the right");
          this.setHelpUrl("");
        }
      };

      Blockly.Blocks['turn_left'] = {
        init: function() {
          this.appendDummyInput()
            .appendField("turn left");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(120);
          this.setTooltip("Turn the character 90 degrees to the left");
          this.setHelpUrl("");
        }
      };
    };

    // Define JavaScript generators using the new API
    const defineJavaScriptGenerators = () => {
      javascriptGenerator.forBlock['move_forward'] = function() {
        return 'moveForward();\n';
      };

      javascriptGenerator.forBlock['turn_right'] = function() {
        return 'turnRight();\n';
      };

      javascriptGenerator.forBlock['turn_left'] = function() {
        return 'turnLeft();\n';
      };
    };

    // Define blocks and generators
    defineCustomBlocks();
    defineJavaScriptGenerators();

    // Toolbox configuration
    const toolbox = {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Movement',
          colour: '#5ba55b',
          contents: [
            { kind: 'block', type: 'move_forward' },
            { kind: 'block', type: 'turn_right' },
            { kind: 'block', type: 'turn_left' }
          ]
        },
        {
          kind: 'category',
          name: 'Loops',
          colour: '#5ba5a5',
          contents: [
            {
              kind: 'block',
              type: 'controls_repeat_ext',
              inputs: {
                TIMES: {
                  shadow: {
                    type: 'math_number',
                    fields: { NUM: 3 }
                  }
                }
              }
            }
          ]
        },
        {
          kind: 'category',
          name: 'Logic',
          colour: '#5b80a5',
          contents: [
            { kind: 'block', type: 'controls_if' },
            { kind: 'block', type: 'logic_compare' }
          ]
        }
      ]
    };

    // Initialize Blockly workspace
    const ws = Blockly.inject(blocklyDiv.current, {
      toolbox: toolbox,
      collapse: true,
      comments: true,
      disable: true,
      maxBlocks: Infinity,
      trashcan: true,
      horizontalLayout: false,
      toolboxPosition: 'start',
      css: true,
      rtl: false,
      scrollbars: true,
      sounds: true,
      oneBasedIndex: true,
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2
      }
    });

    setWorkspace(ws);
    onWorkspaceReady(ws);

    // Listen for workspace changes
    const onWorkspaceChange = () => {
      try {
        const code = javascriptGenerator.workspaceToCode(ws);
        onCodeChange(code);
      } catch (error) {
        console.error('Error generating code:', error);
        onCodeChange('// Error generating code');
      }
    };

    ws.addChangeListener(onWorkspaceChange);

    // Cleanup function
    return () => {
      if (ws) {
        ws.dispose();
      }
    };
  }, [onCodeChange, onWorkspaceReady]);

  return (
    <div className="flex-1 bg-white rounded-lg overflow-hidden">
      <div
        ref={blocklyDiv}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};
