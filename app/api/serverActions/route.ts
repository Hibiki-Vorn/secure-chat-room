interface Message {
  roomName: string;
  username: string;
  message: string;
}

let controllers: Record<string, ReadableStreamDefaultController[]> = {};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const username = url.searchParams.get("username");
  const roomName = url.searchParams.get("room-name");

  if (!username || !roomName) {
    return new Response("Missing parameters", { status: 400 });
  }

  if (!controllers[roomName]) {
    controllers[roomName] = [];
  }

  const stream = new ReadableStream({
    start(controller) {
      controllers[roomName].push(controller);
      broadcast({ roomName, username: "System", message: `${username} connected` });
      setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(`:\n\n`));
        } catch (e) {
          // If not, remove it from the list
          controllers[roomName] = controllers[roomName].filter(c => c !== controller);
        }
      }, 15000);
    },

    cancel(controller) {
      controllers[roomName] = controllers[roomName].filter(c => c !== controller);
      broadcast({ roomName, username: "System", message: `${username} disconnected` });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

export async function POST(request: Request) {
  const { roomName, username, message }: Message = await request.json();

  if (!roomName) {
    return new Response("Missing room name", { status: 400 });
  }

  if (!controllers[roomName]) return new Response("No clients", { status: 200 });
  broadcast({ roomName, username, message });

  return new Response("Message sent", { status: 200 });
}

function broadcast(msg: Message) {
  controllers[msg.roomName].forEach(controller => {
    try {
      controller.enqueue(
        new TextEncoder().encode(
          `data: ${JSON.stringify({ sender: msg.username, text: msg.message })}\n\n`
        )
      );
    } catch (e) {
      controllers[msg.roomName] = controllers[msg.roomName].filter(c => c !== controller);
    }
  });
}