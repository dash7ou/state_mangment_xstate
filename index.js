import { createMachine, interpret } from 'xstate';

function sleep(success= true, ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
        if(success){
            resolve("done")
        }else{
            reject()
        }
    }, ms);
  });
}

const paymentStateMachine = createMachine({
  predictableActionArguments: true,
  initial: 'idle',
  states: {
    idle: {
      on: {
        SUBMIT: [
          {
            target: 'loading',
            cond: (ctx, event) => event?.data?.name && event?.data?.card,
          },
          {
            target: 'error',
          },
        ],
      },
    },
    loading: {
      invoke: {
        id: 'doPayment',
        src: () => sleep(false, 1000),
        onDone: {
          target: 'success',
        },
        onError: {
          target: 'error',
        },
      },
    },
    error: {
      on: {
        SUBMIT: {
          target: 'loading',
          cond: (ctx, event) => event.data.name && event.data.card,
        },
      },
    },
    success: {
      type: 'final',
    },
  },
});

const paymentService = interpret(paymentStateMachine);
paymentService.start();

paymentService.send({ type: 'SUBMIT' });
console.log(paymentService.state.value);
paymentService.send({ type: 'SUBMIT', data: { name: 'mohammed', card: '12255' } });
console.log(paymentService.state.value);
await sleep(true, 2000)
console.log(paymentService.state.value);