# ts2uml

This is a project that converts TypeScript to UML.

## Description

This project, ts2uml, is designed to convert TypeScript code into UML diagrams.

### Use UML-SPRINKLER command to decorate the class with @uml decorator

This script is designed to read TypeScript files from a given directory (including subdirectories) and add a @uml() decorator to any classes that don't already have it. The directory path is provided as a command-line argument.

Executing uml-sprinkler is optional if you choose to do manually annotate the methods and classes.

![Sequence Image](https://raw.githubusercontent.com/senthurai/ts2uml/master/sprnklr.png)


### Use the sequence decorator in your TypeScript classes, follow these steps:

1. Apply the sequence decorator to your class or methods:

```

/**
* class declaration annotated
class MyClass {
    @uml()
    public myMethod() {
        // Method implementation
    }
}

// start the sequence by setting the request id for workflow
setTraceId("R12"); // can be random, unique and retrievable

// Start of the sequence
let l1=new MyClass();
l1.myMethod();

// End of the sequence
console.log(getSequence());
console.log(getSequenceTemplate());
console.log(getFlowDiagram());


/**
* getSequence returns the text uml
*
* output will be like
* sequenceDiagram
* R12->MyClass:myMethod
*
*/

```

![Sequence Image](https://raw.githubusercontent.com/senthurai/ts2uml/master/seq.png)

3. The sequence decorator will modify the original method to apply a graph sequence. It creates a new GraphNode if one does not already exist for the requestId, applies the graph sequence, and handles any errors that occur during the execution of the original method.

## setTraceId

setTraceId is a function used to assign an unique identifier (the sequence ID, which is the same as the request ID in this case) to each request. This is done for tracking, logging, or handling each request in your sequence diagram.

### RequestId in AWS

In AWS, the RequestId is a unique identifier assigned to each request that the service receives. This ID is used to track the request through the system and to identify the request in logs and other diagnostic information. In the context of the sequence diagram, the sequence ID is similar to the RequestId in AWS, as it is used to identify and track each request through the system.

### Use RequestId as SequenceId in AWS context

The request ID can be assigned to the sequence ID and can be used in the AWS context to track and identify each request in a sequence diagram. You can easily identify and track the flow of requests through the sequence diagram. This can be useful for debugging, monitoring, and analyzing the performance of your system.

### ./.ts2uml/

the workspace folder will contain a folder after successful execution which contains the diagram from your code

# UmlConfig  
## Overview

The  umlConfig instance is designed to hold configuration settings for generating UML (Unified Modeling Language) diagrams and provide certail AOP out of box. It provides options to configure the base URL for remote resources, enable linking within the UML diagrams, and control error logging.

## Properties

### `remoteBaseUrl: string`

- **Description**: Specifies the base URL for any remote resources that may be needed for the UML diagram generation. This is particularly useful when diagrams include elements that are hosted remotely.
- **Default Value**: `null`

### `disableErrorLogging: boolean`

- **Description**: Controls whether error logging is disabled. Setting this to `true` suppresses error messages that would normally be logged during the diagram generation process. This can be useful in production environments where logging errors to the console is undesirable.
- **Default Value**: `false`

## Example Usage

```typescript
// Importing the UmlConfig class
import { umlConfig } from './model';

 

// Setting the remote base URL for remote resources
umlConfig.remoteBaseUrl = 'https://example.com/resources/';
 

// Disabling error logging
umlConfig.disableErrorLogging = true;

// The config object now

 contains

 the customized settings
console.log(umlConfig);
```

## Notes

- The `remoteBaseUrl` property is particularly important when dealing with UML diagrams that reference external resources. Ensure that the URL is accessible and correct.
- Enabling links within diagrams enhances interactivity but requires that the diagram rendering engine supports this feature.
- Disabling error logging (`disableErrorLogging`) should be used judiciously, as it can make debugging more difficult by suppressing potentially useful error messages.