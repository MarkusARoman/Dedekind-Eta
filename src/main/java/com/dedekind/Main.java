package com.dedekind;

import static org.lwjgl.glfw.GLFW.*;

public class Main 
{
    private Window window;
    private Shader shader;
    private Quad quad;

    private float startTime;
    private boolean timerStarted = false;

    public void run() {
        init();
        loop();

        quad.delete();
        shader.delete();
        window.destroy();
    }

    private void init() 
    {
        window = new Window(800, 800, "Dedekind Eta");
        window.create();

        shader = new Shader("dedekind");
        shader.compile();

        quad = new Quad();
    }

    private void loop() {
        while (!window.shouldClose()) {
            window.clear();

            shader.use();

            shader.setUniform2f("u_resolution", window.getWidth(), window.getHeight());

            float currentTime = System.nanoTime() / 1_000_000_000.0f;
            float elapsedTime;

            if (!timerStarted && glfwGetKey(window.getHandle(), GLFW_KEY_SPACE) == GLFW_PRESS) {
                timerStarted = true;
                startTime = currentTime;
            }

            if (timerStarted) {
                elapsedTime = currentTime - startTime;
            } else {
                elapsedTime = 0.0f;
            }
            
            shader.setUniform1f("u_time", elapsedTime);

            quad.render();
            window.refresh();
        }
    }

    public static void main(String[] args) {
        new Main().run();
    }
}
