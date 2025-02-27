// 

document.getElementById('calculate-button').addEventListener('click', function() {
    const param = document.getElementById('param').value;
    const precision = document.getElementById('precision').value;
    const hardware = document.getElementById('hardware').value;

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<h2>计算结果:</h2>';

    resultsDiv.innerHTML += `
        <div class="result-item"><strong>模型参数:</strong> ${param}B </div>
        <div class="result-item"><strong>精度:</strong> ${precision}</div>
        <div class="result-item"><strong>算力卡:</strong> ${getHardwareDisplayName(hardware)}</div>
        <div class="result-item"><strong>模型权重显存需求: </strong><strong>${calculateWeightMemory(param, precision)}G</strong></div>
        <div class="result-item"><strong>总显存需求: </strong> <strong>${calculateTotalMemory(param, precision)}G</strong></div>
        <div class="result-item"><strong>预估算力卡需求:</strong> <strong>${calculateCompute(param, precision, hardware)}</strong></div>
        <div class="result-item"><strong>预估算力机台数:</strong> <strong>${calculateMachineCount(param, precision, hardware)} 台</strong></div>
        <p class="result-item" style="font-size: smaller; color: gray;">* 显存和算力均为估算值，实际情况可能因多种因素而异。</p>
        <p class="result-item" style="font-size: smaller; color: gray;">* 请检查所选算力卡是否支持参数精度类型。</p>
        <p class="result-item" style="font-size: smaller; color: gray;">* 推理显存估算公式：总显存需求 = 模型权重显存需求 * 1.2（经验值）</p>
        <p class="result-item" style="font-size: smaller; color: gray;">* 算力卡数量为满足显存需求的最少估算，实际部署可能需要更多卡以满足性能需求。</p>
        <p class="result-item" style="font-size: smaller; color: gray;">* 算力机台数假设 NVIDIA 和 华为昇腾 机器每台都包含 8 张算力卡。
        
    `;

});

function getHardwareDisplayName(hardware) {
    const hardwareDisplayNames = {
        'ascend_910b_64g': '昇腾910b(64G)',
        'ascend_910b_32g': '昇腾910b(32G)',
        'nvidia_a800_40g': 'NVIDIA A800(40G)',
        'nvidia_a100_80g': 'NVIDIA A100(80G)',
        'nvidia_a100_40g': 'NVIDIA A100(40G)',
        'nvidia_a100_80g': 'NVIDIA A100(80G)',
        'nvidia_a10': 'NVIDIA A10',
        'nvidia_h20': 'NVIDIA H20',
        'nvidia_h800': 'NVIDIA H800',
        'nvidia_l40s': 'NVIDIA L40S',
        'nvidia_rtx4090': 'NVIDIA RTX 4090',
    };
    return hardwareDisplayNames[hardware] || hardware;
}

function calculateWeightMemory(param, precision) {
    const precisionDict = {
        'FP16': 2,
        'FP32': 4,
        'BF16': 2,
        'INT8': 1,
        'INT4': 0.5,
    }
    paramSize = precisionDict[precision];
    weightMemory = param * paramSize;
    weightMemory = weightMemory.toFixed(2);
    return weightMemory;
}

function calculateTotalMemory(param, precision) {
    weightMemory = calculateWeightMemory(param, precision);
    totalMemory = weightMemory * 1.2;
    totalMemory = totalMemory.toFixed(2);
    return totalMemory;
}

function calculateCompute(param, precision, hardware) {
    weightMemory = calculateWeightMemory(param, precision);
    const hardwareCompute = {
        'ascend_910b_64g': 64,
        'ascend_910b_32g': 32,
        'nvidia_a800_40g': 40,
        'nvidia_a800_80g': 80,
        'nvidia_a100_40g': 40,
        'nvidia_a100_80g': 80,
        'nvidia_a10': 24,
        'nvidia_h20': 96,
        'nvidia_h800': 80,
        'nvidia_l40s': 48,
        'nvidia_rtx4090': 24,
    };
    compute = weightMemory / hardwareCompute[hardware];
    compute = Math.ceil(compute);
    return compute;
}

function calculateMachineCount(param, precision, hardware) {
    compute = calculateCompute(param, precision, hardware);
    machineCount = compute / 8;
    machineCount = Math.ceil(machineCount);
    return machineCount;
}


