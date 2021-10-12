const Binance = require('node-binance-api');

const binance = new Binance().options({
    APIKEY: 'Tly7FbruhRRhdjCNvRUxsIzv9S08H69jlnX8fM2runBSoABDpwhffK1UDl9bYmOE',
    APISECRET: '<secret>'
});

function objectToString(object) {
    return Object.prototype.toString.call(object);
  }

class QueueItem {
    constructor(value, next) {
      this.value = value;
      this.next = next;
    }
  }
  
class Queue {
    constructor() {
      this.head = null;
      this.tail = null;
    }
    enqueue(value) {
      const newItem = new QueueItem(value, null);
      if (this.tail) {
        this.tail.next = newItem;
      }
      this.tail = newItem
      if (!this.head) {
        this.head = this.tail
      }
    }
    dequeue() {
      if (!this.head) {
        return null;
      }
      const firstNode = this.head;
      if (this.head.next) {
        this.head = this.head.next;
      } else {
        this.head = null; 
        this.tail = null; 
      }
      return firstNode;
    }
    print() {
      let currentNode = this.head;
      while (currentNode) {
        console.log(currentNode.value);
        //process.stdout.write(objectToString(currentNode.value));
        currentNode = currentNode.next;
      }
    }
    percentaje() {
        let percentaje = ((this.tail.value/this.head.value) - 1)*100;
        return percentaje;
      }
}

var estruct = {
    'previous_percentage' : {},
    'percentage' : {},
    'previous_price': {},
    'current_price' : {},
    'percentage_change': {},
    'number': {},
    'best_price': {},
    'queue': {},
    'queue_index': {},
    'queue_volume': {}
}

function date_now() {
    var date = new Date();
    let time_now  = date.toLocaleTimeString();
    console.log(time_now);
  }

function prevDay() {

    date_now();

    binance.prevDay(false, (error, prevDay) => {

        for ( let obj of prevDay ) {

            let symbol = obj.symbol;
            let last_change = 0;

            if((symbol.endsWith('USDT')))//symbol.endsWith('BTC') || symbol.endsWith('USDT'))) 
            {   
                estruct.current_price[symbol] = obj.lastPrice;

                estruct.percentage_change[symbol] = obj.priceChangePercent;
                estruct.current_price[symbol] = obj.lastPrice;

                if(isNaN(estruct.number[symbol])) estruct.number[symbol] = 0; else estruct.number[symbol]++;

                if(estruct.number[symbol] == 0) {
                    estruct.queue[symbol] = new Queue();
                    estruct.queue_index[symbol] = new Queue();
                    estruct.queue_volume[symbol] = new Queue();
                }

                if(isNaN(estruct.previous_price[symbol])) estruct.previous_price[symbol] = estruct.current_price[symbol];
                if(isNaN(estruct.previous_percentage[symbol])) estruct.previous_percentage[symbol] =obj.priceChangePercent; 

                last_change = estruct.current_price[symbol] - estruct.previous_price[symbol];
                estruct.percentage[symbol] = ((estruct.current_price[symbol]/estruct.previous_price[symbol]) - 1)*100;

                let current_price = estruct.current_price[symbol];
                estruct.queue[symbol].enqueue(current_price);

                let percentaje_change = ((estruct.percentage_change[symbol]/estruct.previous_percentage[symbol]) - 1)*100;
                estruct.queue_index[symbol].enqueue(percentaje_change);
                estruct.previous_percentage[symbol] = estruct.percentage_change[symbol];
                estruct.queue_volume[symbol].enqueue(obj.volume);

                if(estruct.number[symbol] == 3) {

                    estruct.number[symbol]--;
                    let index = estruct.queue[symbol].percentaje();

                    if((!isNaN(index)) && (index > 1)) {
                        console.info(index + "%");
                        console.info(estruct.queue[symbol].print());
                        console.info(estruct.queue_index[symbol].print());
                        console.info(estruct.queue_volume[symbol].print());

                        console.info("symbol: " + obj.symbol + "  volume:" + obj.volume + "  change: " + obj.priceChangePercent +"%" + " price: " + obj.lastPrice);
                        console.info("percentage change: " + estruct.percentage[symbol] +"%" );
                        console.info("previous price: " + estruct.previous_price[symbol] + " number:" +  estruct.number[symbol]);
                        console.info("last change: " + estruct.current_price[symbol] + " percentage 24hs:" +  estruct.percentage_change[symbol]);
                        console.info("\n");
                        console.info("\n");
                    }

                    estruct.previous_price[symbol] = estruct.current_price[symbol];

                    estruct.queue[symbol].dequeue();
                    estruct.queue_index[symbol].dequeue();
                    estruct.queue_volume[symbol].dequeue();
                }

            }
        }
    });

    setTimeout(prevDay, 20000);
}

setTimeout(prevDay, 5000);
