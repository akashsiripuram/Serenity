document.addEventListener("DOMContentLoaded", () => {
    let homeBtn = document.getElementById("home-cal-loan");

    function calculateHomeLoan() {
        let p = document.querySelector("#home-loan-amount").value;
        let r = document.querySelector("#home-interest-rate").value;
        let n = document.querySelector("#home-tenure").value;
        const interest = (p * (r * 0.01)) / n;
        const totalEMI = ((p / n) + interest).toFixed(2);
        const totalPayable = (totalEMI * n).toFixed(2);

        let h = document.querySelector("#home-cal-total");
        h.innerHTML = `EMI: ₹${totalEMI}/month <br> Total Payable: ₹${totalPayable}`;

        // Chart Rendering
        var options = {
            series: [{
                data: [parseFloat(p), parseFloat(interest * n), parseFloat(totalPayable)]
            }],
            chart: {
                type: 'bar',
                height: 350
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    distributed: true,
                    barHeight: '80%',
                    dataLabels: {
                        position: 'top'
                    },
                }
            },
            dataLabels: {
                enabled: true,
                formatter: function (val, opts) {
                    return "₹" + val.toFixed(2);
                },
                offsetY: -20,
                style: {
                    fontSize: '12px',
                    colors: ['#304758']
                }
            },
            xaxis: {
                categories: ['Loan Amount', 'Total Interest', 'Total Payable'],
            }
        };

        var chart = new ApexCharts(document.querySelector("#home-chart"), options);
        chart.render();
    }

    // Initial calculation to show pictorial representation
    calculateHomeLoan();

    // Update range value display
    document.querySelectorAll('input[type="range"]').forEach(input => {
        input.addEventListener('input', function () {
            let span = this.nextElementSibling.querySelector('span');
            span.textContent = this.value;
        });
    });

    homeBtn.addEventListener("click", () => {
        calculateHomeLoan();
    });

    // Recalculate total payable when tenure changes
    document.getElementById("home-tenure").addEventListener("input", () => {
        calculateHomeLoan();
    });
});
