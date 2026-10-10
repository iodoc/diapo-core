# Diapo Core

> A lightweight JavaScript presentation engine for the web.

Diapo Core provides slide navigation, presentation modes, accessibility features, keyboard shortcuts, touch support, 
progress tracking, and incremental content rendering.

It is framework-agnostic and works with plain HTML, CSS, and JavaScript.

## Features

- List and fullscreen presentation modes
- Keyboard navigation
- Touch navigation
- Mouse-based navigation
- Incremental slide content
- URL-based navigation
- Progress bar support
- Slide timers
- Accessibility helpers
- Presentation tracking events
- No dependencies

## Getting Started

Include the Diapo Core script in your presentation page and the default Nimbus theme:

```html
<link rel="stylesheet" crossorigin href="/css/nimbus.min.css">
<script type="module" src="diapo-core.js" data-diapo></script>
```

Create a presentation container and add your slides:

```html
<body class="diapo list">

    <header class="caption">
        <h1>My Presentation</h1>

        <div class="paragraph">
            <p>Built with Diapo Core.</p>
        </div>
    </header>

    <section class="slide">
        <h2>Introduction</h2>
    </section>

    <section class="slide">
        <h2>Getting Started</h2>
    </section>

</body>
```

Diapo automatically discovers slides and initializes the presentation when the page loads.

## Demo

Explore the live demo:

👉 https://your-demo-url

## Theme

Diapo Core only provides presentation behavior.

For a complete visual experience, use the official Nimbus theme:

👉 https://github.com/your-org/nimbus

## Navigation

### Keyboard

| Key | Action |
|------|---------|
| Enter | Next slide |
| Shift + Enter | Previous slide |
| Arrow Keys | Navigate |
| Home | First slide |
| End | Last slide |
| Escape | Exit fullscreen |

### Touch

- Tap right side → next slide
- Tap left side → previous slide
- Three-finger tap → exit fullscreen

## Incremental Content

Elements marked with the `.next` class are revealed progressively:

```html
<ul>
    <li class="next">First point</li>
    <li class="next">Second point</li>
    <li class="next">Third point</li>
</ul>
```

## Acknowledgements

Diapo derives from the ideas pioneered by the [Shower](https://shwr.me/) presentation engine.

Shower introduced the concept of HTML-based presentations with dual slide-list and slideshow modes, an approach that 
remains at the heart of Diapo.

## License

MIT License