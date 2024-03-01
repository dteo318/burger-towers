import { defs, tiny } from "./examples/common.js";

import { Shape_From_File } from "./examples/obj-file-demo.js";
import { Text_Line } from "./examples/text-demo.js";

const {
  Vector,
  Vector3,
  vec,
  vec3,
  vec4,
  color,
  hex_color,
  Shader,
  Matrix,
  Mat4,
  Light,
  Shape,
  Material,
  Scene,
  Texture,
} = tiny;

const { Cube, Axis_Arrows, Textured_Phong } = defs;

export class BurgerTowers extends Scene {
  /**
   *  **Base_scene** is a Scene that can be added to any display canvas.
   *  Setup the shapes, materials, camera, and lighting here.
   */
  constructor() {
    // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
    super();

    // TODO - find better background & floor textures/colors
    // TODO - find better burger objs
    this.shapes = {
      burger_bun: new Shape_From_File(
        "assets/burger-bottom-bun/burger-bottom-bun.obj"
      ),
      lettuce: new Shape_From_File("assets/lettuce/lettuce.obj"),
      cheese: new Shape_From_File("assets/cheese/cheese.obj"),
      burger_patty: new Shape_From_File("assets/burger-patty/burger-patty.obj"),
      floor: new defs.Capped_Cylinder(50, 50, [
        [0, 2],
        [0, 1],
      ]),
      sky: new defs.Subdivision_Sphere(4),
    };

    this.materials = {
      burger_bottom_bun: new Material(new Textured_Phong(), {
        ambient: 1,
        color: hex_color("#000000"),
        texture: new Texture(
          "assets/burger-bottom-bun/bun_bottom_bake_denoised.png"
        ),
      }),
      lettuce: new Material(new Textured_Phong(), {
        ambient: 1,
        color: hex_color("#000000"),
        texture: new Texture("assets/lettuce/lettuce_denoised.png"),
      }),
      cheese: new Material(new Textured_Phong(), {
        ambient: 1,
        color: hex_color("#000000"),
        texture: new Texture("assets/cheese/cheese_top_bake_denoised.png"),
      }),
      burger_patty: new Material(new Textured_Phong(), {
        ambient: 1,
        color: hex_color("#000000"),
        texture: new Texture("assets/burger-patty/burger_bake_denoised.png"),
      }),
      floor: new Material(new defs.Phong_Shader(), {
        ambient: 0.3,
        diffusivity: 0.7,
        specularity: 1,
        color: hex_color("#D8DBDE"),
      }),
      sky: new Material(new defs.Phong_Shader(), {
        ambient: 0.8,
        diffusivity: 0.5,
        color: hex_color("#87CEEB"),
      }),
    };

    this.initial_camera_location = Mat4.translation(5, -10, -30);

    // pause the game
    this.paused = false;

    // burger coordinates
    this.y_movement = 0;
    this.x_movement = 0;

    // ingredients to choose from
    this.ingredients = ["lettuce", "cheese", "burger_patty"];
    // coordinates and time offsets of ingredients
    this.x_spawn = Array.from({ length: 5 }, () =>
      Math.floor(Math.cos(Math.random() * Math.PI) * 15)
    );
    // height to drop ingredients from
    this.y_spawn = 25;
    this.ingredient_time_offsets = Array(5).fill(0);
    // the current ingredient falling from top
    this.falling_ingredients = Array.from(
      { length: 5 },
      () =>
        this.ingredients[Math.floor(Math.random() * this.ingredients.length)]
    );

    // ingredients that are currently stacked
    this.stacked_ingredients = [];
    // offset while displaying stacked ingredients
    // offset when stacking ingredients
    this.stack_offset = 0.75;
  }

  make_control_panel() {
    // // Start Game (enter key)
    // this.key_triggered_button("Start", ['Enter'], () => {
    //     this.startgame =! this.startgame;
    //     // loop background audio
    //     if (typeof this.background_sound.loop == 'boolean')
    //     {
    //         this.background_sound.loop = true;
    //     }
    //     else
    //     {
    //         this.background_sound.addEventListener('ended', function() {
    //             this.currentTime = 0;
    //             this.play();
    //         }, false);
    //     }
    //     this.background_sound.play();
    // });
    // ****** User Burger Interactions ****** //
    // Up Movement (arrow key up)
    this.key_triggered_button("Up", ["ArrowUp"], () => {
      if (this.y_movement < 37 && !this.paused) {
        this.y_movement = this.y_movement + 1;
      }
    });
    // Down Movement (arrow key down)
    this.key_triggered_button("Down", ["ArrowDown"], () => {
      if (this.y_movement > -3 && !this.paused) {
        this.y_movement = this.y_movement - 1;
      }
    });
    // Left Movement (arrow key left)
    this.key_triggered_button("Left", ["ArrowLeft"], () => {
      if (this.x_movement > -37 && !this.paused)
        this.x_movement = this.x_movement - 1;
    });
    // Right Movement (arrow key right)
    this.key_triggered_button("Right", ["ArrowRight"], () => {
      if (this.x_movement < 24 && !this.paused) {
        this.x_movement = this.x_movement + 1;
      }
    });
    // ******** Extra key triggered features ********* //
    // this.key_triggered_button("Change Lighting Color", ['c'], () => {
    //     this.change_lighting_color = true;
    // });
    // this.key_triggered_button("Stop Music", ['s'], () => {
    //     // loop background audio
    //     this.background_sound.pause();
    // });
    // // Pause Game (p key)
    // this.key_triggered_button("Pause", ['p'], () => {
    //     this.paused =! this.paused;
    // });
  }

  new_ingredient_coords(ingredient_count, t) {
    this.x_spawn[ingredient_count] = Math.floor(
      Math.cos(Math.random() * Math.PI) * 15
    );
    this.ingredient_time_offsets[ingredient_count] = t;
    this.falling_ingredients[ingredient_count] =
      this.ingredients[Math.floor(Math.random() * this.ingredients.length)];
  }

  detect_ingredient_collision(ingredient_count, t, speed) {
    // ingredient coordinates
    const ingredient_x_coords = this.x_spawn[ingredient_count];
    const ingredient_y_coords =
      this.y_spawn +
      (this.ingredient_time_offsets[ingredient_count] - t) * speed;
    // burger coordinates
    const burger_x_coords = this.x_movement;
    // y offset for stacked ingredients contact
    const burger_y_coords =
      this.y_movement + this.stack_offset * this.stacked_ingredients.length + 1;

    // scaling coordinates
    const ingredient_to_burger_x_coords =
      ingredient_x_coords * (59 / 44) - 9 / 44;
    const ingredient_to_burger_y_coords =
      ingredient_y_coords * (37 / 17) - 19 / 17;

    if (
      Math.abs(burger_x_coords - ingredient_to_burger_x_coords) < 4 &&
      // Math.abs(burger_x_coords - ingredient_to_burger_x_coords) > 1.75 &&
      Math.abs(burger_y_coords - ingredient_to_burger_y_coords) < 2 &&
      Math.abs(burger_y_coords - ingredient_to_burger_y_coords) > 1.85
    ) {
      // collision occured
      // storing ingredient as a stacked ingredient
      this.stacked_ingredients.push({
        ingredient: this.falling_ingredients[ingredient_count],
        x_offset: burger_x_coords - ingredient_to_burger_x_coords,
      });
      // reset ingredient
      this.new_ingredient_coords(ingredient_count, t);
    }
  }

  draw_falling_ingredient(
    context,
    program_state,
    model_transform,
    ingredient_count,
    t,
    speed,
    shadow_pass
  ) {
    // let fish_color = this.fish_color_array[fish_count];
    // var x_cord = this.x_spawn_left[fish_count];
    // var y_cord = this.y_spawn_left[fish_count];
    const ingredient = this.falling_ingredients[ingredient_count];
    const x_coord = this.x_spawn[ingredient_count];
    const y_coord = this.y_spawn;

    /* Checks if current x-coord is offscreen, if its not ingredients just drop */
    if (
      y_coord + (this.ingredient_time_offsets[ingredient_count] - t) * speed >
      0
    ) {
      const model_transform_ingredient = model_transform
        .times(Mat4.translation(x_coord, y_coord, 0, 0))
        .times(
          Mat4.translation(
            0,
            (this.ingredient_time_offsets[ingredient_count] - t) * speed,
            0,
            0
          )
        )
        .times(Mat4.scale(1.5, 1.8, 1, 0));

      // this.shapes[ingredient].draw(
      //   context,
      //   program_state,
      //   model_transform_ingredient,
      //   shadow_pass
      //     ? this.materials.guppies.override({ color: fish_color })
      //     : this.pure
      // );
      this.shapes[ingredient].draw(
        context,
        program_state,
        model_transform_ingredient,
        this.materials[ingredient]
      );
      /* If ingredient is off screen, we update its time offset since we use time to translate in above bracket
           Also updated coordinates so it looks more random
        */
    } else {
      this.new_ingredient_coords(ingredient_count, t);
    }
  }

  draw_stacked_ingredients(context, program_state, model_transform) {
    for (let i = 0; i < this.stacked_ingredients.length; i++) {
      const { ingredient, x_offset } = this.stacked_ingredients[i];
      const ingredient_x_coords = this.x_movement - x_offset;
      const ingredient_y_coords = this.y_movement + this.stack_offset * i + 1;
      const model_transform_ingredient = model_transform
        .times(Mat4.scale(1.5, 1.8, 1, 0))
        .times(
          Mat4.translation(
            ingredient_x_coords / 2,
            ingredient_y_coords / 2,
            0,
            0
          )
        );

      this.shapes[ingredient].draw(
        context,
        program_state,
        model_transform_ingredient,
        this.materials[ingredient]
      );
    }
  }

  render_scene(
    context,
    program_state,
    shadow_pass,
    draw_light_source = false,
    draw_shadow = false
  ) {
    let t = program_state.animation_time,
      dt = program_state.animation_delta_time / 1000;
    let model_transform = Mat4.identity();

    // Draw background
    const background_transform = model_transform
      .times(Mat4.scale(60, 60, 60))
      .times(Mat4.rotation(0, 0, 1, 0))
      .times(Mat4.rotation(Math.PI / 1.8, 1, 0, 0))
      .times(Mat4.rotation(t / 40000, 0, 1, 0));
    this.shapes.sky.draw(
      context,
      program_state,
      background_transform,
      this.materials.sky
    );
    const floor_transform = model_transform
      .times(Mat4.rotation(0, 0, 1, 0))
      .times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
      .times(Mat4.translation(0, 0, 2))
      .times(Mat4.scale(50, 25, 0.5));
    this.shapes.floor.draw(
      context,
      program_state,
      floor_transform,
      this.materials.floor
    );

    const ingredient_count = 1;
    const ingredient_fall_speed = 5;
    for (let i = 0; i < ingredient_count; i++) {
      this.draw_falling_ingredient(
        context,
        program_state,
        model_transform,
        i,
        t / 1000,
        ingredient_fall_speed,
        shadow_pass
      );

      if (this.paused) {
        this.detect_ingredient_collision(i, t / 1000, 0);
      } else {
        this.detect_ingredient_collision(i, t / 1000, ingredient_fall_speed);
      }
    }

    // rendering the player burger bun
    const x = this.x_movement;
    const y = this.y_movement;
    const model_transform_burger = Mat4.identity()
      .times(Mat4.scale(1.5, 1.8, 1, 0))
      .times(Mat4.translation(x / 2, y / 2, 0, 0));

    this.shapes.burger_bun.draw(
      context,
      program_state,
      model_transform_burger,
      this.materials.burger_bottom_bun
    );

    // rendering ingredients stacked on the burger bun
    this.draw_stacked_ingredients(context, program_state, model_transform);
  }

  display(context, program_state) {
    if (!context.scratchpad.controls) {
      this.children.push(
        (context.scratchpad.controls = new defs.Movement_Controls())
      );
      // Define the global camera and projection matrices, which are stored in program_state.
      program_state.set_camera(this.initial_camera_location);
    }

    program_state.projection_transform = Mat4.perspective(
      Math.PI / 4,
      context.width / context.height,
      1,
      100
    );

    const light_position = vec4(-5, 20, 5, 1);
    program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

    this.render_scene(context, program_state, false, false, false);
  }
}
