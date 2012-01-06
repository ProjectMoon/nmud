nmud
====
The NodeJS MUD server.

Game Objects
============
Game objects (mobiles, rooms, items, etc) are composed of *traits* and
*prototypes*. Traits and prototypes add methods and properties to the objects 
they are mixed into. The differentiation between a trait and prototype is
entirely logical; traits are more akin to interfaces that add common meta
functionality to an object, while a prototype is supposed to define what
the object *is*.

Another way to look at it is that traits define what an object is in metagame
terms, while a prototype defines what the object is in game terms.

Examples:

* A room has the `Container` trait and the `Room` prototype.
* A player has the `Player` trait and `Mobile` prototype.
* A weapon might have the `Item` and `Weapon` prototypes.

Traits
------
The current list of traits follows.

### Container ###
Use: `traits.Container`

Signifies that this object can store other objects inside it. This is more
generic than a container in the literal sense. A Container can store ANY mud
object, such as mobiles, items, or entities.
  
Properties:
  
  * None.
  
Methods: 
  
  * `canStore(mudObj)`: Determines what the Container can store. Override to
  limit what types of objects can be stored. By default, stores everything.
  * `add(mudObj)`: Adds a mud object to this Container.
  * `remove(mudObjOrMemID)`: Removes a mud object by memory ID or by object
    reference.
  * `find(name)`: Finds a mud object in the container by name (e.g. "sword").

### Player ###
Use: `traits.Player(socket)`

The Player trait allows the object to be under a player's control. This trait
adds properties and events that connect the player object to a socket so the
player can control it. The socket is optional. If it is not passed in, the
object will be divorced from any remote connection.
  
Properties:
  
  * `socket`: The currently connected socket. Will be null if there is no
     socket.

Methods:

  * `send(data)`: Sends some data to the other end of the player's socket.
  * `command(text)`: Execute a command as if it were received from the socket.

Events:

  * `command(data)`: Fired when a command is executed. `data` is the command
    text.
  * `move(oldRoom, newRoom)`: Fired when the player moves from one room to
     another.
    
Prototypes
----------
The current list of prototypes follows.

### Mobile ###
Use: `protos.Mobile`

Signifies that this object is a mobile. Mobiles encompass both PCs and NPCs
usually. A player will be a mobile with a class, leveling, and other stats.
An NPC will be a mobile with AI and other things.
  
Properties:

  * `commandContext`: A dynamic property that always returns a context for
    command execution. Do not override.
  * `name`: The name of the mobile. Will be displayed to other occupants of a
    room.
  * `room`: The current room the mobile is in.

Methods:

  * `move(newRoom)`: Move to a new room.
    
### Room ###
Use: `protos.Room`

A Room is an object that has a title, description, and exits that link it to
other Rooms. Rooms are also usually Containers, so they can have mobiles and
items and entities inside them.
  
Properties:
  
  * `north`: The north exit.
  * `south`: The south exit.
  * `east`: The east exit.
  * `west`: The west exit.
  * `up`: The up exit.
  * `down`: The down exit.
    
Events:

  * `enter(obj)`: Fired when a mud object enters the room via movement.
  * `exit(obj)`: Fired when a mud object leaves the room via movement.



Design
======
Rules of Business Logic:

1. Do not emit any information output events in anything but commands or ticker.
2. Prototype/Trait events should not do any output.
