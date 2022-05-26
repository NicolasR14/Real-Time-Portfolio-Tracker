function merge_balances(balance, list) {
  var obj = list.find((o) => o.asset === balance.asset);
  if (obj) {
    obj.amount += balance.amount;
    if (obj.value && balance.value) {
      obj.value += balance.value;
    }
    return;
  }
  list.push(balance);
}

function merge_lists(lists) {
  var return_list = lists[0].map((object) => ({ ...object }));

  for (const l of lists.slice(1)) {
    for (balance of l) {
      merge_balances(balance, return_list);
    }
  }
  return return_list;
}

module.exports = { merge_balances, merge_lists };
