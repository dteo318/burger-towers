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
      square: new defs.Square(),
      burger_bun: new Shape_From_File(
        "assets/burger-bottom-bun/burger-bottom-bun.obj"
      ),
      lettuce: new Shape_From_File("assets/lettuce/lettuce.obj"),
      cheese: new Shape_From_File("assets/cheese/cheese.obj"),
      burger_patty: new Shape_From_File("assets/burger-patty/burger-patty.obj"),
      // floor: new defs.Capped_Cylinder(50, 50, [
      //   [0, 2],
      //   [0, 1],
      // ]),
      floor: new Cube(),
      sky: new defs.Subdivision_Sphere(4),
      text: new Text_Line(35),
      diner: new Cube(),
      counter: new Cube(),
      painting1: new Cube(),
      painting2: new defs.Square(),
      painting3: new defs.Square(),
      trash: new Cube(),
      trash_title: new defs.Square()
    };

    this.materials = {
      // For starting screen
      starting_screen_pic: new Material(new defs.Textured_Phong(1), 
        { ambient: 1, 
          diffusivity: .9, 
          specularity: 1, 
          color: hex_color("#000000"), 
          texture: new Texture("assets/loading-screen/burgershop2.png")
      }),
      title: new Material(new Textured_Phong(),
      {
        ambient: 1,
        diffusivity: 0,
        specularity: 0,
        texture: new Texture("assets/loading-screen/title.png")
      }),

      // For in game
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
      pause_btn: new Material(new defs.Textured_Phong(1), {
        ambient: 1,
        diffusivity: .9, 
        specularity: 1, 
        color: hex_color("#000000"), 
        texture: new Texture("assets/in-game/pause.png")
      }),

      // In game background
      floor: new Material(new Textured_Phong(), {
        ambient: 1,
        color: hex_color("#000000"),
        texture: new Texture("assets/background/tilefloor.png", "NEAREST")
      }),
      sky: new Material(new defs.Phong_Shader(), {
        ambient: 0.8,
        diffusivity: 0.5,
        color: hex_color("#87CEEB"),
      }),
      diner_walls: new Material(new defs.Phong_Shader, {
        ambient: 0.8,
        diffusivity: 0.5,
        color: hex_color("E2A499")
      }),
      counter: new Material(new defs.Phong_Shader, {
        ambient: 0.8,
        diffusivity: 0.5,
        color: hex_color("B5651D")
      }),
      trash: new Material(new defs.Phong_Shader, {
        ambient: 0,
        color: hex_color("000000")
      }),
      trash_title: new Material(new Textured_Phong, {
        ambient: 0.8,
        diffusivity: 0.5,
        texture: new Texture("assets/background/trash_img.png")
      }),
      painting: new Material(new Textured_Phong, {
        ambient: 0.8,
        diffusivity: 0.5,
        color: hex_color("000000"),
        texture: new Texture("assets/background/burgerpainting1.png")
      }),
      painting2: new Material(new Textured_Phong, {
        ambient: 0.8,
        diffusivity: 0.5,
        color: hex_color("000000"),
        texture: new Texture("assets/background/burgerpainting2.png")
      }),
      painting3: new Material(new Textured_Phong, {
        ambient: 0.8,
        diffusivity: 0.5,
        color: hex_color("000000"),
        texture: new Texture("assets/background/burgerpainting4.png")
      }),
      burger_dollar: new Material(new Textured_Phong(), {
        ambient: 1,
        diffusivity: 0.9,
        specularity: 1,
        texture: new Texture("assets/burger_dollar.png"),
      }),
      text_image: new Material(new Textured_Phong(), {
        ambient: 1,
        diffusivity: 0,
        specularity: 0,
        texture: new Texture("assets/text.png"),
      }),
    };

    this.initial_camera_location = Mat4.translation(5, -10, -30);

    // start game button
    this.startgame = false;

    // TODO - add ability to pause the game
    // pause the game
    this.paused = false;
    this.isFalling = 1;

    // burger coordinates
    this.y_movement = 1;
    this.x_movement = -7;

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
    // ingredients unstacked
    this.unstacked_ingredients = [];
    // TODO - expand on game scoring
    // point counting for game
    this.burger_points = 0;
  }

  make_control_panel() {
    // // Start Game (enter key)
    this.key_triggered_button("Start", ['Enter'], () => {
        this.startgame =! this.startgame;
    }); 
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
      if (this.y_movement < 23 && !this.paused) {
        this.y_movement = this.y_movement + 1;
      }
    });
    // Down Movement (arrow key down)
    this.key_triggered_button("Down", ["ArrowDown"], () => {
      if (this.y_movement > -1 && !this.paused) {
        this.y_movement = this.y_movement - 1;
      }
    });
    // Left Movement (arrow key left)
    this.key_triggered_button("Left", ["ArrowLeft"], () => {
      if (this.x_movement > -33 && !this.paused)
        this.x_movement = this.x_movement - 1;
    });
    // Right Movement (arrow key right)
    this.key_triggered_button("Right", ["ArrowRight"], () => {
      if (this.x_movement < 20 && !this.paused) {
        this.x_movement = this.x_movement + 1;
      }
    });
    // TODO - add menu and settings options
    // ******** Extra key triggered features ********* //
    // this.key_triggered_button("Change Lighting Color", ['c'], () => {
    //     this.change_lighting_color = true;
    // });
    // this.key_triggered_button("Stop Music", ['s'], () => {
    //     // loop background audio
    //     this.background_sound.pause();
    // });
    // Pause Game (p key)
    this.key_triggered_button("Pause", ['p'], () => {
        this.paused =! this.paused;
    });
  }

  new_ingredient_coords(ingredient_count, t) {
    this.x_spawn[ingredient_count] = Math.floor(
      Math.cos(Math.random() * Math.PI) * 15
    );
    this.ingredient_time_offsets[ingredient_count] = t;
    this.falling_ingredients[ingredient_count] =
      this.ingredients[Math.floor(Math.random() * this.ingredients.length)];
  }

  // TODO - smoothen collision detection
  detect_ingredient_collision(ingredient_count, t, speed) {
    // ingredient coordinates
    const ingredient_x_coords = this.x_spawn[ingredient_count];
    const ingredient_y_coords =
      this.y_spawn +
      (this.ingredient_time_offsets[ingredient_count] - t) * speed;
    // burger coordinates
    const burger_x_coords = this.x_movement;
    // y offset for stacked ingredients contact
    const stacked_ingredients_offset = this.stacked_ingredients.reduce(
      (offset, stacked_ingredient) => offset + stacked_ingredient.y_offset,
      0
    );
    const burger_y_coords = this.y_movement - stacked_ingredients_offset;
    // scaling ingredient coordinates to burger coordinates
    const ingredient_to_burger_x_coords =
      ingredient_x_coords * (59 / 44) - 9 / 44;
    const ingredient_to_burger_y_coords =
      ingredient_y_coords * (37 / 17) - 19 / 17;

    if (
      Math.abs(burger_x_coords - ingredient_to_burger_x_coords) < 4 &&
      // Math.abs(burger_x_coords - ingredient_to_burger_x_coords) > 1.75 &&
      Math.abs(burger_y_coords - ingredient_to_burger_y_coords) < 0.8
      // Math.abs(burger_y_coords - ingredient_to_burger_y_coords) > 1.85
    ) {
      // collision occured
      // storing ingredient as a stacked ingredient
      this.stacked_ingredients.push({
        ingredient: this.falling_ingredients[ingredient_count],
        x_offset: burger_x_coords - ingredient_to_burger_x_coords,
        y_offset: burger_y_coords - ingredient_to_burger_y_coords,
      });
      this.burger_points += 1;
      // reset ingredient
      this.new_ingredient_coords(ingredient_count, t);
    }
  }

  // TODO - draw shadow under falling ingredients
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
    const dt = program_state.animation_delta_time / 1000;
    this.ingredient_time_offsets[ingredient_count] -= !this.paused * dt * speed;
    const y_offset = this.ingredient_time_offsets[ingredient_count]
     

      /* Checks if current x-coord is offscreen, if its not ingredients just drop */
    if (y_coord + y_offset > -1) {
        const model_transform_ingredient = model_transform
          .times(Mat4.translation(x_coord, y_coord, 0, 0))
          .times(Mat4.translation(0, y_offset, 0, 0))
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
      // ingredient missed
      this.unstacked_ingredients.push({
        ingredient: this.falling_ingredients[ingredient_count],
        x_coords: x_coord,
        y_coords: y_coord + y_offset,
      });
      this.new_ingredient_coords(ingredient_count, t);
    }
  }

  draw_stacked_ingredients(context, program_state, model_transform) {
    let y_offset_sum = 0;
    for (let i = 0; i < this.stacked_ingredients.length; i++) {
      const { ingredient, x_offset, y_offset } = this.stacked_ingredients[i];
      y_offset_sum += y_offset;
      const ingredient_x_coords = this.x_movement - x_offset;
      const ingredient_y_coords = this.y_movement - y_offset_sum;
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

  draw_unstacked_ingredients(context, program_state, model_transform) {
    for (let i = 0; i < this.unstacked_ingredients.length; i++) {
      const { ingredient, x_coords, y_coords } = this.unstacked_ingredients[i];
      const model_transform_ingredient = model_transform
        .times(Mat4.translation(x_coords, y_coords, 0, 0))
        .times(Mat4.scale(1.5, 1.8, 1, 0));

      this.shapes[ingredient].draw(
        context,
        program_state,
        model_transform_ingredient,
        this.materials[ingredient]
      );
    }
  }

  // TODO - make more objects to decorate the "diner"
  draw_background_items(context, program_state, model_transform, t) { 
    let floor_transform = model_transform
        .times(Mat4.rotation(0, 0, 1, 0))
        .times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
        .times(Mat4.translation(-10, -3, 2))
        .times(Mat4.scale(50, 25, 0.5));

      this.shapes.floor.draw(
        context,
        program_state,
        floor_transform,
        this.materials.floor
      );

      // The wall
      let diner_background_transform = model_transform.times(Mat4.scale(60, 60, 60))
                                                      .times(Mat4.rotation(0, 0, 1, 0))
                                                      .times(Mat4.rotation(Math.PI / 1.8, 1, 0, 0))
                                                      .times(Mat4.rotation(t / 40000, 0, 1, 0));
      this.shapes.diner.draw(context, program_state, diner_background_transform, this.materials.diner_walls);

      // Counter
      let counter_transform = model_transform.times(Mat4.translation(-5,0,-17,0))
                                              .times(Mat4.scale(50,4,4,0));
      this.shapes.counter.draw(context, program_state, counter_transform, this.materials.counter);
    
      // Trash object on the left
      let trash_transform = model_transform.times(Mat4.translation(-25,0.5,-17,0))
                                            .times(Mat4.scale(2,4,2,0));
      this.shapes.trash.draw(context, program_state, trash_transform, this.materials.trash);

      let trash_title_transform = model_transform.times(Mat4.translation(-23.75, 1.25, -12,0))
                                                  .times(Mat4.scale(1.5,1.5,1,0));
      this.shapes.trash_title.draw(context, program_state, trash_title_transform, this.materials.trash_title);

      // Paintings in the back on the wall
      let painting_transform = model_transform.times(Mat4.translation(-5,18,-17,0))
                                              .times(Mat4.scale(4,4,1,0));
      this.shapes.painting1.draw(context, program_state, painting_transform, this.materials.painting);
      
      let painting2_transform = model_transform.times(Mat4.translation(-25,18,-17,0))
                                                .times(Mat4.scale(4,4,1,0));
      this.shapes.painting2.draw(context, program_state, painting2_transform, this.materials.painting2);

      let painting3_transform = model_transform.times(Mat4.translation(15,18,-17,0))
      .times(Mat4.scale(4,4,1,0));
      this.shapes.painting3.draw(context, program_state, painting3_transform, this.materials.painting3);
      
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
    
    if (this.startgame){
      // Draw points count
      let dash_model = Mat4.identity()
        .times(Mat4.translation(11.8, 19.4, 4, 0))
        .times(Mat4.scale(1.3, 1.3, 0.2, 5));
      let point_string = this.burger_points;
      this.shapes.text.set_string(point_string.toString(), context.context);
      this.shapes.square.draw(
        context,
        program_state,
        dash_model.times(Mat4.scale(0.5, 0.5, 0.5)),
        this.materials.burger_dollar
      );
      dash_model = dash_model.times(Mat4.translation(1, -0.09, 0));
      this.shapes.text.draw(
        context,
        program_state,
        dash_model.times(Mat4.scale(0.5, 0.5, 0.5)),
        this.materials.text_image
      );

      // Draws all the items in the background
      this.draw_background_items(context, program_state, model_transform, t)
      
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

          let pause_btn_transform = model_transform.times(Mat4.translation(-5,10,11,0)).times(Mat4.scale(4,4,0.2,5));
          this.shapes.square.draw(context, program_state, pause_btn_transform, this.materials.pause_btn);

        } else {
          this.detect_ingredient_collision(i, t/ 1000, ingredient_fall_speed);
        }
      }

      // TODO - draw shadow under burger bun
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
      // rendering ingredients on stove top
      this.draw_unstacked_ingredients(context, program_state, model_transform);
    }
    // Loading screen and start up screen
    if (!this.startgame) {
      const time = t / 1000;
      const loading_time_start = 0;
      const loading_time_end = 6;
      let start_text_transform = Mat4.identity().times(Mat4.translation(-10,13,11,0)).times(Mat4.scale(1.2,1.2,0.2,5));
      if (time >= loading_time_start && time <= loading_time_end){
        if (time < 2){
          this.shapes.text.set_string("LOADING GAME.", context.context);  
          this.shapes.text.draw(context, program_state, start_text_transform.times(Mat4.scale(.35, .35, .50)), this.materials.text_image);
        }
        else if (time < 4){
          this.shapes.text.set_string("LOADING GAME..", context.context);  
          this.shapes.text.draw(context, program_state, start_text_transform.times(Mat4.scale(.35, .35, .50)), this.materials.text_image);
        }
        else if (time < loading_time_end){
          this.shapes.text.set_string("LOADING GAME...", context.context);  
          this.shapes.text.draw(context, program_state, start_text_transform.times(Mat4.scale(.35, .35, .50)), this.materials.text_image);
        }
      }    

      if (time > loading_time_end) {
        // Title
        let title_transform = Mat4.identity().times(Mat4.translation(-4.5,13,11,0)).times(Mat4.scale(10,5,0.2,5));
        this.shapes.square.draw(context, program_state, title_transform, this.materials.title);

        // Start game text
        let start_text_transform = Mat4.identity().times(Mat4.translation(-11.3,13,11,0)).times(Mat4.scale(1.2,1.2,0.2,5));
        this.shapes.text.set_string("Press Enter to Begin!", context.context);  
        this.shapes.text.draw(context, program_state, start_text_transform.times(Mat4.scale(.35, .35, .50)), this.materials.text_image);

        // Background image of the burger shop for the starting screen
        let start_screen_transform = model_transform.times(Mat4.translation(-5,9,9,0)).times(Mat4.scale(16, 11, 1));
        this.shapes.square.draw(context, program_state, start_screen_transform, this.materials.starting_screen_pic);
      }
    }
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

export class Shadow_Textured_Phong_Shader extends defs.Phong_Shader {
  shared_glsl_code() {
      // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
      return ` precision mediump float;
          const int N_LIGHTS = ` + this.num_lights + `;
          uniform float ambient, diffusivity, specularity, smoothness;
          uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
          uniform float light_attenuation_factors[N_LIGHTS];
          uniform vec4 shape_color;
          uniform vec3 squared_scale, camera_center;
  
          // Specifier "varying" means a variable's final value will be passed from the vertex shader
          // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
          // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
          varying vec3 N, vertex_worldspace;
          // ***** PHONG SHADING HAPPENS HERE: *****                                       
          vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace, 
                  out vec3 light_diffuse_contribution, out vec3 light_specular_contribution ){                                        
              // phong_model_lights():  Add up the lights' contributions.
              vec3 E = normalize( camera_center - vertex_worldspace );
              vec3 result = vec3( 0.0 );
              light_diffuse_contribution = vec3( 0.0 );
              light_specular_contribution = vec3( 0.0 );
              for(int i = 0; i < N_LIGHTS; i++){
                  // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                  // light will appear directional (uniform direction from all points), and we 
                  // simply obtain a vector towards the light by directly using the stored value.
                  // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                  // the point light's location from the current surface point.  In either case, 
                  // fade (attenuate) the light as the vector needed to reach it gets longer.  
                  vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                                 light_positions_or_vectors[i].w * vertex_worldspace;                                             
                  float distance_to_light = length( surface_to_light_vector );
  
                  vec3 L = normalize( surface_to_light_vector );
                  vec3 H = normalize( L + E );
                  // Compute the diffuse and specular components from the Phong
                  // Reflection Model, using Blinn's "halfway vector" method:
                  float diffuse  =      max( dot( N, L ), 0.0 );
                  float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                  float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                  
                  vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                            + light_colors[i].xyz * specularity * specular;
                  light_diffuse_contribution += attenuation * shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse;
                  light_specular_contribution += attenuation * shape_color.xyz * specularity * specular;
                  result += attenuation * light_contribution;
                }
              return result;
            } `;
  }
  vertex_glsl_code() {
      // ********* VERTEX SHADER *********
      return this.shared_glsl_code() + `
          varying vec2 f_tex_coord;
          attribute vec3 position, normal;                            
          // Position is expressed in object coordinates.
          attribute vec2 texture_coord;
          
          uniform mat4 model_transform;
          uniform mat4 projection_camera_model_transform;
  
          void main(){                                                                   
              // The vertex's final resting place (in NDCS):
              gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
              // The final normal vector in screen space.
              N = normalize( mat3( model_transform ) * normal / squared_scale);
              vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
              // Turn the per-vertex texture coordinate into an interpolated variable.
              f_tex_coord = texture_coord;
            } `;
  }

  fragment_glsl_code() {
      // ********* FRAGMENT SHADER *********
      // A fragment is a pixel that's overlapped by the current triangle.
      // Fragments affect the final image or get discarded due to depth.
      return this.shared_glsl_code() + `
          varying vec2 f_tex_coord;
          uniform sampler2D texture;
          uniform sampler2D light_depth_texture;
          uniform mat4 light_view_mat;
          uniform mat4 light_proj_mat;
          uniform float animation_time;
          uniform float light_depth_bias;
          uniform bool use_texture;
          uniform bool draw_shadow;
          uniform float light_texture_size;
          
          float PCF_shadow(vec2 center, float projected_depth) {
              float shadow = 0.0;
              float texel_size = 1.0 / light_texture_size;
              for(int x = -1; x <= 1; ++x)
              {
                  for(int y = -1; y <= 1; ++y)
                  {
                      float light_depth_value = texture2D(light_depth_texture, center + vec2(x, y) * texel_size).r; 
                      shadow += projected_depth >= light_depth_value + light_depth_bias ? 1.0 : 0.0;        
                  }    
              }
              shadow /= 9.0;
              return shadow;
          }
          
          void main(){
              // Sample the texture image in the correct place:
              vec4 tex_color = texture2D( texture, f_tex_coord );
              if (!use_texture)
                  tex_color = vec4(0, 0, 0, 1);
              if( tex_color.w < .01 ) discard;
              
              // Compute an initial (ambient) color:
              gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
              
              // Compute the final color with contributions from lights:
              vec3 diffuse, specular;
              vec3 other_than_ambient = phong_model_lights( normalize( N ), vertex_worldspace, diffuse, specular );
              
              // Deal with shadow:
              if (draw_shadow) {
                  vec4 light_tex_coord = (light_proj_mat * light_view_mat * vec4(vertex_worldspace, 1.0));
                  // convert NDCS from light's POV to light depth texture coordinates
                  light_tex_coord.xyz /= light_tex_coord.w; 
                  light_tex_coord.xyz *= 0.5;
                  light_tex_coord.xyz += 0.5;
                  float light_depth_value = texture2D( light_depth_texture, light_tex_coord.xy ).r;
                  float projected_depth = light_tex_coord.z;
                  
                  bool inRange =
                      light_tex_coord.x >= 0.0 &&
                      light_tex_coord.x <= 1.0 &&
                      light_tex_coord.y >= 0.0 &&
                      light_tex_coord.y <= 1.0;
                        
                  float shadowness = PCF_shadow(light_tex_coord.xy, projected_depth);
                  
                  if (inRange && shadowness > 0.3) {
                      diffuse *= 0.2 + 0.8 * (1.0 - shadowness);
                      specular *= 1.0 - shadowness;
                  }
              }
              
              gl_FragColor.xyz += diffuse + specular;
          } `;
  }

  send_gpu_state(gl, gpu, gpu_state, model_transform) {
      // send_gpu_state():  Send the state of our whole drawing context to the GPU.
      const O = vec4(0, 0, 0, 1), camera_center = gpu_state.camera_transform.times(O).to3();
      gl.uniform3fv(gpu.camera_center, camera_center);
      // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
      const squared_scale = model_transform.reduce(
          (acc, r) => {
              return acc.plus(vec4(...r).times_pairwise(r))
          }, vec4(0, 0, 0, 0)).to3();
      gl.uniform3fv(gpu.squared_scale, squared_scale);
      // Send the current matrices to the shader.  Go ahead and pre-compute
      // the products we'll need of the of the three special matrices and just
      // cache and send those.  They will be the same throughout this draw
      // call, and thus across each instance of the vertex shader.
      // Transpose them since the GPU expects matrices as column-major arrays.
      const PCM = gpu_state.projection_transform.times(gpu_state.view_mat).times(model_transform);
      gl.uniformMatrix4fv(gpu.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
      gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));
      // shadow related
      gl.uniformMatrix4fv(gpu.light_view_mat, false, Matrix.flatten_2D_to_1D(gpu_state.light_view_mat.transposed()));
      gl.uniformMatrix4fv(gpu.light_proj_mat, false, Matrix.flatten_2D_to_1D(gpu_state.light_proj_mat.transposed()));

      // Omitting lights will show only the material color, scaled by the ambient term:
      if (!gpu_state.lights.length)
          return;

      const light_positions_flattened = [], light_colors_flattened = [];
      for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
          light_positions_flattened.push(gpu_state.lights[Math.floor(i / 4)].position[i % 4]);
          light_colors_flattened.push(gpu_state.lights[Math.floor(i / 4)].color[i % 4]);
      }
      gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
      gl.uniform4fv(gpu.light_colors, light_colors_flattened);
      gl.uniform1fv(gpu.light_attenuation_factors, gpu_state.lights.map(l => l.attenuation));
  }

  update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
      // update_GPU(): Add a little more to the base class's version of this method.
      super.update_GPU(context, gpu_addresses, gpu_state, model_transform, material);
      // Updated for assignment 4
      context.uniform1f(gpu_addresses.animation_time, gpu_state.animation_time / 1000);
      if (material.color_texture && material.color_texture.ready) {
          // Select texture unit 0 for the fragment shader Sampler2D uniform called "texture":
          context.uniform1i(gpu_addresses.color_texture, 0); // 0 for color texture
          // For this draw, use the texture image from correct the GPU buffer:
          context.activeTexture(context["TEXTURE" + 0]);
          material.color_texture.activate(context);
          context.uniform1i(gpu_addresses.use_texture, 1);
      }
      else {
          context.uniform1i(gpu_addresses.use_texture, 0);
      }
      if (gpu_state.draw_shadow) {
          context.uniform1i(gpu_addresses.draw_shadow, 1);
          context.uniform1f(gpu_addresses.light_depth_bias, 0.003);
          context.uniform1f(gpu_addresses.light_texture_size, LIGHT_DEPTH_TEX_SIZE);
          context.uniform1i(gpu_addresses.light_depth_texture, 1); // 1 for light-view depth texture}
          if (material.light_depth_texture && material.light_depth_texture.ready) {
              context.activeTexture(context["TEXTURE" + 1]);
              material.light_depth_texture.activate(context, 1);
          }
      }
      else {
          context.uniform1i(gpu_addresses.draw_shadow, 0);
      }
  }
}
