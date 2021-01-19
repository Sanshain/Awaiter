### Awaiter preloader

## Using

Use rollup to compile the `*.ts` files:

Use this packages.json: 

```
{
  "name": "static",
  "version": "1.0.0",
  "description": "",
  "main": "./source/main.js",
  "scripts": {
    "build": "rollup -c"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "rollup": "^2.30.0",    
    "rollup-plugin-typescript": "^1.0.1",
    "rollup-plugin-uglify": "^6.0.4",
    "tslib": "^2.0.3",
    "typescript": "^4.0.3"
  },
  "dependencies": {
    
  }
}
```

Sample of rollup.config.js: 

```


export default [
    {
        input: './ts/awaiter.ts',        
        output: { 
            file: './js/awaiter.js',                                  
            format: 'iife', // 
            sourcemap: true,
            name: 'Awaiter'
        },
        plugins: [            
            typescript({
                lib: ["es6", "dom"], //es5
                target: "es5",
                sourceMap: true      
            }),
            /*
            uglify({
                ie8: false,            
                mangle: true
            }) //*/                    
        ]
    },
]
```

For example using inside django-templates: 

```
{% load static %}
<script src="{% static 'js/awaiter.js' %}"></script>
<script src="{% static 'style/awaiter.css' %}"></script>
<div id="await__container"></div>
<script>
	Awaiter.Start();
</script>
```

# Using in Svelte:

For using with Svelte just change in rollup.config.js output part:
```
        output: { 
            file: './js/awaiter.js',                                  
            format: 'es',
            sourcemap: true,            
        }
```
and use:
```
import Awaiting from './awaiter'
// ...
Awaiting.Start();

// or with options:

Awaiting.Start({
	limit: 70, 				// animation time until auto shutdown
	blocks_amount: 3		// amount of animated elements
});
```
